import express from 'express';
import { query } from '../config/db.js';
import { authenticatePatientToken } from '../middleware/patientAuth.js';

const router = express.Router();

// Helper to evaluate vitals thresholds
function evaluateVitals(vitals) {
  const findings = [];
  let riskScore = 0;

  // 1. Blood Glucose (mg/dL)
  if (vitals.blood_glucose !== undefined && vitals.blood_glucose !== null) {
    const bg = parseFloat(vitals.blood_glucose);
    if (bg > 180) {
      findings.push({ vital: 'Blood Glucose', status: 'High', message: `Elevated glucose level (${bg} mg/dL). High risk of hyperglycemia.` });
      riskScore += 2;
    } else if (bg > 140) {
      findings.push({ vital: 'Blood Glucose', status: 'Elevated', message: `Slightly elevated glucose (${bg} mg/dL). Monitor carb intake.` });
      riskScore += 1;
    } else if (bg < 70) {
      findings.push({ vital: 'Blood Glucose', status: 'Low', message: `Low glucose level (${bg} mg/dL). Risk of hypoglycemia.` });
      riskScore += 2;
    } else {
      findings.push({ vital: 'Blood Glucose', status: 'Normal', message: `Glucose level is optimal (${bg} mg/dL).` });
    }
  }

  // 2. SpO2 (%)
  if (vitals.spo2 !== undefined && vitals.spo2 !== null) {
    const spo2 = parseFloat(vitals.spo2);
    if (spo2 < 90) {
      findings.push({ vital: 'SpO2', status: 'Critical', message: `Oxygen saturation severely low (${spo2}%). Immediate medical evaluation advised.` });
      riskScore += 3;
    } else if (spo2 < 95) {
      findings.push({ vital: 'SpO2', status: 'Sub-optimal', message: `Oxygen saturation slightly below normal (${spo2}%).` });
      riskScore += 1;
    } else {
      findings.push({ vital: 'SpO2', status: 'Normal', message: `Oxygen saturation is optimal (${spo2}%).` });
    }
  }

  // 3. Resting Heart Rate (rhr, bpm)
  if (vitals.rhr !== undefined && vitals.rhr !== null) {
    const rhr = parseFloat(vitals.rhr);
    if (rhr > 100) {
      findings.push({ vital: 'Resting Heart Rate', status: 'High', message: `Elevated resting heart rate (${rhr} bpm). Possible tachycardia or stress.` });
      riskScore += 1;
    } else if (rhr < 50) {
      findings.push({ vital: 'Resting Heart Rate', status: 'Low', message: `Low resting heart rate (${rhr} bpm). Check for bradycardia.` });
      riskScore += 1;
    } else {
      findings.push({ vital: 'Resting Heart Rate', status: 'Normal', message: `Heart rate is within normal range (${rhr} bpm).` });
    }
  }

  // 4. Heart Rate Variability (hrv, ms)
  if (vitals.hrv !== undefined && vitals.hrv !== null) {
    const hrv = parseFloat(vitals.hrv);
    if (hrv < 35) {
      findings.push({ vital: 'Heart Rate Variability', status: 'Low', message: `Low HRV (${hrv} ms) indicates high autonomic stress or physical fatigue.` });
      riskScore += 1;
    } else {
      findings.push({ vital: 'Heart Rate Variability', status: 'Normal', message: `HRV is healthy (${hrv} ms).` });
    }
  }

  // 5. Temperature (°F or °C)
  if (vitals.temp !== undefined && vitals.temp !== null) {
    const temp = parseFloat(vitals.temp);
    // Standardize handling if passed in °C (e.g. 37.0) vs °F (e.g. 98.6)
    const isCelsius = temp < 45;
    const tempF = isCelsius ? (temp * 9 / 5) + 32 : temp;

    if (tempF > 100.4) {
      findings.push({ vital: 'Body Temperature', status: 'Fever', message: `Fever detected (${tempF.toFixed(1)}°F / ${temp}°C). Hydrate and monitor symptoms.` });
      riskScore += 2;
    } else {
      findings.push({ vital: 'Body Temperature', status: 'Normal', message: `Temperature is normal (${tempF.toFixed(1)}°F).` });
    }
  }

  // 6. Sleep Duration (hours or minutes)
  if (vitals.sleep !== undefined && vitals.sleep !== null) {
    const rawSleep = parseFloat(vitals.sleep);
    const sleepHours = rawSleep > 24 ? rawSleep / 60 : rawSleep; // convert mins if > 24

    if (sleepHours < 6) {
      findings.push({ vital: 'Sleep Duration', status: 'Low', message: `Short sleep duration (${sleepHours.toFixed(1)} hrs). Target 7-9 hours for optimal recovery.` });
      riskScore += 1;
    } else {
      findings.push({ vital: 'Sleep Duration', status: 'Optimal', message: `Good sleep duration (${sleepHours.toFixed(1)} hrs).` });
    }
  }

  // Determine overall risk level
  let overall_level = 'Optimal';
  if (riskScore >= 3) {
    overall_level = 'High Risk';
  } else if (riskScore >= 1) {
    overall_level = 'Attention Needed';
  }

  // Generate readable summary text
  const abnormalCount = findings.filter(f => !['Normal', 'Optimal'].includes(f.status)).length;
  let summary = '';
  if (overall_level === 'Optimal') {
    summary = 'All monitored vitals are within healthy physiological ranges. Excellent overall status!';
  } else if (overall_level === 'Attention Needed') {
    summary = `Analysis detected ${abnormalCount} sub-optimal metric(s). Minor adjustments to hydration, sleep, or diet recommended.`;
  } else {
    summary = `Warning: ${abnormalCount} metric(s) indicate elevated risk. Prompt consultation with a specialist is advised.`;
  }

  return { overall_level, findings, summary };
}

// @route   POST /api/ai-analyzer/analyze
// @desc    Run rule-based vitals analysis and save results
router.post('/analyze', authenticatePatientToken, async (req, res) => {
  const { vitals } = req.body;

  if (!vitals || typeof vitals !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Vitals payload object is required (e.g. { blood_glucose, spo2, rhr, hrv, temp, sleep })'
    });
  }

  try {
    const evaluation = evaluateVitals(vitals);

    const result = await query(
      `INSERT INTO ai_analysis_results (patient_id, vitals_input, overall_level, findings, summary)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.patient.id,
        JSON.stringify(vitals),
        evaluation.overall_level,
        JSON.stringify(evaluation.findings),
        evaluation.summary
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Vitals AI analysis completed',
      result: result.rows[0]
    });
  } catch (err) {
    console.error('AI Analysis Error:', err);
    res.status(500).json({ success: false, message: 'Server error running vitals analysis' });
  }
});

// @route   GET /api/ai-analyzer/history
// @desc    Get historical AI analysis results for patient
router.get('/history', authenticatePatientToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM ai_analysis_results WHERE patient_id = $1 ORDER BY created_at DESC`,
      [req.patient.id]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      history: result.rows
    });
  } catch (err) {
    console.error('AI History Error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching analysis history' });
  }
});

export default router;
