import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { UnitConversionService, VelocityUnit, PressureUnit, TempUnit } from './unit-conversion.service';

@Injectable({ providedIn: 'root' })
export class TelemetryService {
  public isConnected$ = new BehaviorSubject<boolean>(false);
  public isLoading$ = new BehaviorSubject<boolean>(true);
  public lastUpdated$ = new BehaviorSubject<Date | null>(null);

  public selectedUnits = {
    velocity: 'cm/s' as VelocityUnit,
    pressure: 'mbar' as PressureUnit,
    temperature: '°C' as TempUnit
  };

  private socket$!: WebSocketSubject<any>;

  constructor(private http: HttpClient, private converter: UnitConversionService) {}

  getWebSocketStream(): Observable<any> {
    this.socket$ = webSocket('ws://localhost:3000/api/dashboard');
    return this.socket$.pipe(
      map(data => {
        this.isConnected$.next(true);
        this.isLoading$.next(false);
        this.lastUpdated$.next(new Date());
        return this.processData(data);
      }),
      catchError(() => {
        this.isConnected$.next(false);
        this.isLoading$.next(false);
        return of(null);
      })
    );
  }

  

  public processData(data: any) {
    return {
      timestamp: data.timestamp,
      velocity: {
        raw: data.velocity.value,
        value: this.converter.convertVelocity(data.velocity.value, this.selectedUnits.velocity),
        unit: this.selectedUnits.velocity,
        status: this.converter.getStatus(data.velocity.value, 'velocity'),
        history: data.velocity.history.map((h: any) => ({
          time: h.time,
          value: this.converter.convertVelocity(h.value, this.selectedUnits.velocity)
        }))
      },
      pressure: {
        raw: data.pressure.value,
        value: this.converter.convertPressure(data.pressure.value, this.selectedUnits.pressure),
        unit: this.selectedUnits.pressure,
        status: this.converter.getStatus(data.pressure.value, 'pressure'),
        history: data.pressure.history.map((h: any) => ({
          time: h.time,
          value: this.converter.convertPressure(h.value, this.selectedUnits.pressure)
        }))
      },
      temperature: {
        raw: data.temperature.value,
        value: this.converter.convertTemp(data.temperature.value, this.selectedUnits.temperature),
        unit: this.selectedUnits.temperature,
        status: this.converter.getStatus(data.temperature.value, 'temperature'),
        history: data.temperature.history.map((h: any) => ({
          time: h.time,
          value: this.converter.convertTemp(h.value, this.selectedUnits.temperature)
        }))
      }
    };
  }
}