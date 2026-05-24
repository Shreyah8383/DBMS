import React, { useState } from 'react';
import { Calculator, ArrowRight, Activity, Smile, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function BMICalculator() {
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('175');
  const [system, setSystem] = useState<'metric' | 'imperial'>('metric');
  const [bmi, setBmi] = useState<number | null>(22.86);
  const [category, setCategory] = useState<string>('Normal weight');
  const [color, setColor] = useState<string>('text-emerald-500');
  const [bgBarColor, setBgBarColor] = useState<string>('bg-emerald-500');

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;

    let calculatedBmi = 0;
    if (system === 'metric') {
      // height in cm to meters
      const heightInMeters = h / 100;
      calculatedBmi = w / (heightInMeters * heightInMeters);
    } else {
      // imperial: lbs * 703 / inches^2
      calculatedBmi = (w * 703) / (h * h);
    }

    const roundedBmi = parseFloat(calculatedBmi.toFixed(2));
    setBmi(roundedBmi);

    // Categories definition
    if (roundedBmi < 18.5) {
      setCategory('Underweight');
      setColor('text-blue-500');
      setBgBarColor('bg-blue-500');
    } else if (roundedBmi >= 18.5 && roundedBmi < 25) {
      setCategory('Normal weight');
      setColor('text-emerald-500');
      setBgBarColor('bg-emerald-500');
    } else if (roundedBmi >= 25 && roundedBmi < 30) {
      setCategory('Overweight');
      setColor('text-amber-500');
      setBgBarColor('bg-amber-500');
    } else {
      setCategory('Obesity');
      setColor('text-rose-500');
      setBgBarColor('bg-rose-500');
    }
  };

  const adviceMap: Record<string, string[]> = {
    'Underweight': [
      'Focus on nutrient-dense foods: whole grains, lean proteins, avocados, and nuts.',
      'Slightly increase portion sizes and incorporate healthy snacking.',
      'Incorporate strength training exercises to build muscle bulk safely.'
    ],
    'Normal weight': [
      'Strive to maintain your current balanced lifestyle.',
      'Ensure a variety of whole clean vegetables, fruits, and proper physical activity.',
      'Keep hydrated: target 2 to 3 liters of water intake daily.'
    ],
    'Overweight': [
      'Incorporate at least 150 minutes of moderate aerobic exercise (brisk walking, cycling) weekly.',
      'Strive for portion control and reduce intake of processed sugars or simple carbohydrates.',
      'Drink a glass of water before meals to regulate dynamic satiety.'
    ],
    'Obesity': [
      'We recommend speaking with a medical professional or clinical dietitian for a structured plan.',
      'Incorporate daily moderate steps to protect joints while improving cardiovascular tone.',
      'Focus on permanent lifestyle updates rather than crash diets.'
    ]
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 id-bmi-calc" id="bmi-calculator-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl" id="bmi-calc-icon-head">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-serif font-black italic text-xl text-blue-950 dark:text-blue-100" id="bmi-calc-header-title">Body Mass Index (BMI) Calculator</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium" id="bmi-calc-header-subtitle">Measure and track body composition metrics instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="bmi-calc-layout-grid">
        {/* Input Parameters Column */}
        <form onSubmit={calculateBMI} className="lg:col-span-5 space-y-5" id="bmi-form">
          <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg" id="bmi-system-toggle">
            <button
              id="bmi-system-metric-btn"
              type="button"
              onClick={() => {
                setSystem('metric');
                setWeight('70');
                setHeight('175');
                setBmi(22.86);
                setCategory('Normal weight');
                setColor('text-emerald-500');
                setBgBarColor('bg-emerald-500');
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                system === 'metric'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Metric (kg/cm)
            </button>
            <button
              id="bmi-system-imperial-btn"
              type="button"
              onClick={() => {
                setSystem('imperial');
                setWeight('154');
                setHeight('68');
                setBmi(23.41);
                setCategory('Normal weight');
                setColor('text-emerald-500');
                setBgBarColor('bg-emerald-500');
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
                system === 'imperial'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Imperial (lbs/in)
            </button>
          </div>

          <div className="space-y-4" id="bmi-inputs-block">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2" htmlFor="bmi-height-input" id="bmi-height-label">
                Height {system === 'metric' ? '(in cm)' : '(in inches)'}
              </label>
              <div className="relative">
                <input
                  id="bmi-height-input"
                  type="number"
                  min="30"
                  max="300"
                  step="any"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-700 dark:text-white"
                  placeholder={system === 'metric' ? 'e.g. 175' : 'e.g. 68'}
                  required
                />
                <span className="absolute right-4 top-3 text-slate-400 dark:text-slate-500 text-sm font-medium">
                  {system === 'metric' ? 'cm' : 'in'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2" htmlFor="bmi-weight-input" id="bmi-weight-label">
                Weight {system === 'metric' ? '(in kg)' : '(in lbs)'}
              </label>
              <div className="relative">
                <input
                  id="bmi-weight-input"
                  type="number"
                  min="5"
                  max="600"
                  step="any"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-700 dark:text-white"
                  placeholder={system === 'metric' ? 'e.g. 70' : 'e.g. 154'}
                  required
                />
                <span className="absolute right-4 top-3 text-slate-400 dark:text-slate-500 text-sm font-medium">
                  {system === 'metric' ? 'kg' : 'lbs'}
                </span>
              </div>
            </div>
          </div>

          <button
            id="bmi-submit-btn"
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            Calculate BMI Metrics
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Visual Gauge Columns */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6" id="bmi-results-display">
          {bmi !== null ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 md:p-6 border border-slate-100 dark:border-slate-850 flex flex-col justify-between flex-1"
              id="bmi-results-box"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5" id="bmi-results-header">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs block">Your Calculated Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white" id="bmi-value-text">{bmi}</span>
                    <span className="text-slate-400 dark:text-slate-600 font-semibold text-sm">kg/m²</span>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-sm flex items-center gap-2 font-black ${color}`} id="bmi-category-tag">
                  <Activity className="h-4 w-4 shrink-0" />
                  {category}
                </div>
              </div>

              {/* Progress Scale representation */}
              <div className="space-y-2 mb-6" id="bmi-bar-indicators-panel">
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex" id="bmi-composite-bar">
                  <div className="h-full w-[18.5%] bg-blue-400" title="Underweight (< 18.5)"></div>
                  <div className="h-full w-[25%] bg-emerald-400" title="Normal Weight (18.5 - 24.9)"></div>
                  <div className="h-full w-[15%] bg-amber-400" title="Overweight (25 - 29.9)"></div>
                  <div className="h-full w-[41.5%] bg-rose-400" title="Obese (>= 30)"></div>
                </div>

                {/* Gauge marker indicator */}
                <div className="relative w-full h-6" id="bmi-bar-legend-container">
                  <div
                    className="absolute -top-1 transition-all duration-500 flex flex-col items-center"
                    style={{
                      left: `${Math.min(Math.max(((bmi - 12) / 28) * 100, 2), 98)}%`,
                      transform: 'translateX(-50%)'
                    }}
                    id="bmi-pointer"
                  >
                    <div className="border-4 border-transparent border-b-slate-800 dark:border-b-slate-650 h-0 w-0"></div>
                    <span className="text-[10px] font-extrabold bg-slate-800 dark:bg-slate-700 text-white rounded-md px-1.5 py-0.5 mt-1 block shadow">
                      {bmi}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips panel based on score */}
              <div id="bmi-advice-panel" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-start gap-2.5 text-slate-700" id="bmi-advice-body">
                  <Smile className={`h-5 w-5 mt-0.5 shrink-0 ${color}`} />
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2">Life Line Medical Guidance:</h5>
                    <ul className="space-y-1.5" id="bmi-advice-list">
                      {(adviceMap[category] || []).map((tip, index) => (
                        <li key={index} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex items-center gap-1.5" id={`bmi-tip-item-${index}`}>
                          <span className={`${bgBarColor} h-1.5 w-1.5 rounded-full shrink-0`}></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center" id="bmi-no-results-panel">
              <Calculator className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm font-semibold">Enter your height and weight parameters to evaluate your body mass indexes.</p>
            </div>
          )}

          {/* Reference guidelines card */}
          <div className="bg-blue-50/50 dark:bg-slate-900/40 border border-blue-50 dark:border-slate-800 rounded-xl p-4 flex gap-3 text-blue-800 dark:text-blue-300 text-xs text-left" id="bmi-limits-card">
            <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-extrabold mb-1">Standard Clinical Classifications Reference:</p>
              <p className="leading-relaxed text-blue-600 dark:text-blue-400">
                • Underweight: &lt; 18.5 kg/m² | • Normal Weight: 18.5 – 24.9 kg/m² <br />
                • Overweight: 25.0 – 29.9 kg/m² | • Obese: &ge; 30.0 kg/m²
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
