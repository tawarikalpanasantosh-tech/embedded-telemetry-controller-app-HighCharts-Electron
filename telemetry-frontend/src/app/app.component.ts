import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HighchartsChartComponent} from 'highcharts-angular';

import type Highcharts from 'highcharts/esm/highcharts';

import { Subscription } from 'rxjs';

import { TelemetryService } from '../services/telemetry.service';
import { UnitConversionService } from '../services/unit-conversion.service';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [
    CommonModule,
    HighchartsChartComponent
  ],

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  isDarkMode = false;

  private dataSub!: Subscription;

  velocityGaugeOptions: Highcharts.Options = {};
  pressureGaugeOptions: Highcharts.Options = {};
  tempGaugeOptions: Highcharts.Options = {};

  velocityChartOptions: Highcharts.Options = {};
  pressureChartOptions: Highcharts.Options = {};
  tempChartOptions: Highcharts.Options = {};

  updateFlag = false;

  constructor(
    public telemetryService: TelemetryService,
    public converter: UnitConversionService
  ) {}

  ngOnInit(): void {

    this.initChartConfigs();

    this.dataSub =
      this.telemetryService
        .getWebSocketStream()
        .subscribe({

          next: (data: any) => {

            if (data) {
              this.updateCharts(data);
            }

          },

          error: (error) => {
            console.error('Telemetry stream error:', error);
          }

        });
  }

  // --------------------------------------------------
  // CHART CONFIGURATION
  // --------------------------------------------------

  initChartConfigs(): void {

    const createGaugeConfig = (
      title: string,
      min: number,
      max: number
    ): Highcharts.Options => ({

      chart: {
        type: 'solidgauge',
        height: '200px',
        backgroundColor: 'transparent'
      },

      title: {
        text: title,
        style: {
          color: '#888'
        }
      },

      pane: {
        center: ['50%', '85%'],

        size: '140%',

        startAngle: -90,

        endAngle: 90,

        background: [
          {
            backgroundColor: '#EEE',
            innerRadius: '60%',
            outerRadius: '100%',
            shape: 'arc'
          }
        ]
      },

      tooltip: {
        enabled: false
      },

      yAxis: {

        min,

        max,

        stops: [
          [0.5, '#55BF3B'],
          [0.8, '#DDDF0D'],
          [0.9, '#DF5353']
        ],

        lineWidth: 0,

        tickWidth: 0,

        labels: {
          y: 16
        }
      },

      plotOptions: {

        solidgauge: {

          dataLabels: {
            y: 5,
            borderWidth: 0,
            useHTML: true
          }

        }

      },

      series: [
        {
          type: 'solidgauge',
          name: title,
          data: [0]
        }
      ]

    });


    const createLineConfig = (
      title: string,
      color: string
    ): Highcharts.Options => ({

      chart: {

        type: 'line',

        zoomType: 'x',

        panning: {
          enabled: true,
          type: 'x'
        },

        panKey: 'shift',

        height: '400px',

        backgroundColor: 'transparent'
      },

      title: {

        text: `${title} History (100 Samples)`,

        style: {
          fontSize: '14px'
        }

      },

      xAxis: {

        type: 'category',

        categories: []

      },

      yAxis: {

        title: {
          text: 'Value'
        }

      },

      tooltip: {

        shared: true,

        valueDecimals: 2

      },

      credits: {
        enabled: false
      },

      series: [

        {
          type: 'line',

          name: title,

          color,

          data: []

        }

      ]

    });


    // -----------------------------
    // GAUGES
    // -----------------------------

    this.velocityGaugeOptions =
      createGaugeConfig(
        'Velocity',
        0,
        300
      );

    this.pressureGaugeOptions =
      createGaugeConfig(
        'Pressure',
        0,
        1500
      );

    this.tempGaugeOptions =
      createGaugeConfig(
        'Temperature',
        0,
        100
      );


    // -----------------------------
    // LINE CHARTS
    // -----------------------------

    this.velocityChartOptions =
      createLineConfig(
        'Velocity Trend',
        '#2196F3'
      );

    this.pressureChartOptions =
      createLineConfig(
        'Pressure Trend',
        '#FF9800'
      );

    this.tempChartOptions =
      createLineConfig(
        'Temperature Trend',
        '#E91E63'
      );

  }


  // --------------------------------------------------
  // UPDATE CHARTS
  // --------------------------------------------------

  updateCharts(data: any): void {

    // -----------------------------
    // VELOCITY GAUGE
    // -----------------------------

    this.velocityGaugeOptions = {

      ...this.velocityGaugeOptions,

      series: [
        {
          type: 'solidgauge',

          name: 'Velocity',

          data: [
            data.velocity.value
          ]
        }
      ]

    };


    // -----------------------------
    // PRESSURE GAUGE
    // -----------------------------

    this.pressureGaugeOptions = {

      ...this.pressureGaugeOptions,

      series: [
        {
          type: 'solidgauge',

          name: 'Pressure',

          data: [
            data.pressure.value
          ]
        }
      ]

    };


    // -----------------------------
    // TEMPERATURE GAUGE
    // -----------------------------

    this.tempGaugeOptions = {

      ...this.tempGaugeOptions,

      series: [
        {
          type: 'solidgauge',

          name: 'Temperature',

          data: [
            data.temperature.value
          ]
        }
      ]

    };


    // -----------------------------
    // VELOCITY HISTORY
    // -----------------------------

    this.velocityChartOptions = {

      ...this.velocityChartOptions,

      xAxis: {

        type: 'category',

        categories:
          data.velocity.history.map(
            (h: any) => h.time
          )

      },

      series: [

        {
          type: 'line',

          name: `Velocity (${data.velocity.unit})`,

          color: '#2196F3',

          data:
            data.velocity.history.map(
              (h: any) => h.value
            )

        }

      ]

    };


    // -----------------------------
    // PRESSURE HISTORY
    // -----------------------------

    this.pressureChartOptions = {

      ...this.pressureChartOptions,

      xAxis: {

        type: 'category',

        categories:
          data.pressure.history.map(
            (h: any) => h.time
          )

      },

      series: [

        {
          type: 'line',

          name: `Pressure (${data.pressure.unit})`,

          color: '#FF9800',

          data:
            data.pressure.history.map(
              (h: any) => h.value
            )

        }

      ]

    };


    // -----------------------------
    // TEMPERATURE HISTORY
    // -----------------------------

    this.tempChartOptions = {

      ...this.tempChartOptions,

      xAxis: {

        type: 'category',

        categories:
          data.temperature.history.map(
            (h: any) => h.time
          )

      },

      series: [

        {
          type: 'line',

          name: `Temperature (${data.temperature.unit})`,

          color: '#E91E63',

          data:
            data.temperature.history.map(
              (h: any) => h.value
            )

        }

      ]

    };


    // Trigger Highcharts update
    this.updateFlag = true;

  }


  // --------------------------------------------------
  // UNIT CHANGE
  // --------------------------------------------------

  onUnitChange(
    type: 'velocity' | 'pressure' | 'temperature',
    event: Event
  ): void {

    const target =
      event.target as HTMLSelectElement;

    (this.telemetryService.selectedUnits as any)[type] =
      target.value;

  }


  // --------------------------------------------------
  // DARK / LIGHT THEME
  // --------------------------------------------------

  toggleTheme(): void {

    this.isDarkMode =
      !this.isDarkMode;

    document.body.classList.toggle(
      'dark-theme',
      this.isDarkMode
    );

  }


  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  ngOnDestroy(): void {

    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }

  }

}