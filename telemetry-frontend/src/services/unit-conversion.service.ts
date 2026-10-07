import { Injectable } from '@angular/core';

export type VelocityUnit = 'mm/s' | 'cm/s' | 'm/s' | 'km/h' | 'ft/s';
export type PressureUnit = 'Pa' | 'kPa' | 'mbar' | 'bar' | 'psi' | 'atm';
export type TempUnit = '°C' | '°F' | 'K';

@Injectable({ providedIn: 'root' })
export class UnitConversionService {
  convertVelocity(val: number, targetUnit: VelocityUnit): number {
    const inCmS: Record<VelocityUnit, number> = {
      'mm/s': val * 10,
      'cm/s': val,
      'm/s': val / 100,
      'km/h': (val / 100) * 3.6,
      'ft/s': val / 30.48
    };
    return Number(inCmS[targetUnit].toFixed(2));
  }

  convertPressure(val: number, targetUnit: PressureUnit): number {
    const inPa = val * 100; // 1 mbar = 100 Pa
    const conversions: Record<PressureUnit, number> = {
      'Pa': inPa,
      'kPa': inPa / 1000,
      'mbar': val,
      'bar': inPa / 100000,
      'psi': inPa / 6894.76,
      'atm': inPa / 101325
    };
    return Number(conversions[targetUnit].toFixed(2));
  }

  convertTemp(val: number, targetUnit: TempUnit): number {
    if (targetUnit === '°F') return Number(((val * 9) / 5 + 32).toFixed(2));
    if (targetUnit === 'K') return Number((val + 273.15).toFixed(2));
    return Number(val.toFixed(2));
  }

  getStatus(valInBase: number, type: 'velocity' | 'pressure' | 'temperature'): 'Normal' | 'Warning' | 'Critical' {
    const thresholds = {
      velocity: { warn: 200, crit: 230 },
      pressure: { warn: 1030, crit: 1060 },
      temperature: { warn: 40, crit: 45 }
    };
    const t = thresholds[type];
    if (valInBase >= t.crit) return 'Critical';
    if (valInBase >= t.warn) return 'Warning';
    return 'Normal';
  }
}