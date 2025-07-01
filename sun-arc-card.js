// sun-arc-card.js
// Home Assistant Custom Card for Sun Arc Control

class SunArcCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateSunData(hass);
  }

  getCardSize() {
    return 4;
  }

  updateSunData(hass) {
    if (!hass || !hass.states['sun.sun']) return;
    
    const sunEntity = hass.states['sun.sun'];
    const nextRising = new Date(sunEntity.attributes.next_rising);
    const nextSetting = new Date(sunEntity.attributes.next_setting);
    
    // Format times for the component
    const sunriseTime = nextRising.toTimeString().slice(0, 5);
    const sunsetTime = nextSetting.toTimeString().slice(0, 5);
    
    // Update the Vue app if it exists
    if (this.vueApp) {
      this.vueApp.sunriseTime = sunriseTime;
      this.vueApp.sunsetTime = sunsetTime;
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .card-container {
          padding: 16px;
          background: var(--ha-card-background, var(--card-background-color, white));
          border-radius: var(--ha-card-border-radius, 12px);
          box-shadow: var(--ha-card-box-shadow, none);
          border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
        }

        .sun-arc-control {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 20px;
          color: white;
          font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .sun-arc-container {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .sun-arc-svg {
          max-width: 100%;
          height: auto;
        }

        .background-arc {
          opacity: 0.3;
        }

        .active-arc {
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
        }

        .sun-circle {
          filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.8));
          animation: pulse 2s ease-in-out infinite;
        }

        .sun-rays {
          animation: rotate 20s linear infinite;
          transform-origin: 0 0;
        }

        .time-label {
          fill: rgba(255, 255, 255, 0.9);
          font-size: 12px;
          font-weight: bold;
        }

        .current-time {
          fill: white;
          font-size: 18px;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .status-text {
          text-align: center;
        }

        .status-message {
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .time-remaining {
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      </style>
      
      <div class="card-container">
        <div class="sun-arc-control">
          <div class="sun-arc-container">
            <svg
              width="400"
              height="240"
              viewBox="0 0 400 240"
              class="sun-arc-svg"
            >
              <!-- Background arc -->
              <path
                d="M 50 200 A 150 150 0 0 1 350 200"
                stroke="#e0e0e0"
                stroke-width="4"
                fill="none"
                class="background-arc"
              />
              
              <!-- Active arc -->
              <path
                id="active-arc"
                stroke="url(#sunGradient)"
                stroke-width="6"
                fill="none"
                class="active-arc"
                stroke-linecap="round"
              />
              
              <!-- Sun icon -->
              <g id="sun-group">
                <circle
                  r="12"
                  fill="url(#sunGradient)"
                  class="sun-circle"
                />
                <!-- Sun rays -->
                <g class="sun-rays" id="sun-rays"></g>
              </g>
              
              <!-- Sunrise icon -->
              <g transform="translate(50, 200)">
                <circle r="8" fill="#FF6B35" opacity="0.7" />
                <text x="0" y="25" text-anchor="middle" class="time-label" id="sunrise-time"></text>
              </g>
              
              <!-- Sunset icon -->
              <g transform="translate(350, 200)">
                <circle r="8" fill="#FF6B35" opacity="0.7" />
                <text x="0" y="25" text-anchor="middle" class="time-label" id="sunset-time"></text>
              </g>
              
              <!-- Current time display -->
              <text x="200" y="30" text-anchor="middle" class="current-time" id="current-time"></text>
              
              <!-- Gradients -->
              <defs>
                <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#FFA500;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#FF6B35;stop-opacity:1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <!-- Status text -->
          <div class="status-text">
            <p class="status-message" id="status-message"></p>
            <p class="time-remaining" id="time-remaining"></p>
          </div>
        </div>
      </div>
    `;

    this.startUpdating();
  }

  startUpdating() {
    // Update every minute
    this.updateInterval = setInterval(() => {
      this.updateDisplay();
    }, 60000);
    
    // Initial update
    this.updateDisplay();
  }

  updateDisplay() {
    if (!this._hass || !this._hass.states['sun.sun']) return;

    const sunEntity = this._hass.states['sun.sun'];
    const now = new Date();
    
    // Get sunrise and sunset for today
    let sunrise, sunset;
    
    if (sunEntity.state === 'above_horizon') {
      sunrise = new Date(sunEntity.attributes.next_rising);
      sunset = new Date(sunEntity.attributes.next_setting);
      // Adjust sunrise to yesterday if it's in the future
      if (sunrise > now) {
        sunrise = new Date(sunrise.getTime() - 24 * 60 * 60 * 1000);
      }
    } else {
      sunrise = new Date(sunEntity.attributes.next_rising);
      sunset = new Date(sunEntity.attributes.next_setting);
      // Adjust sunset to yesterday if needed
      if (sunset < sunrise) {
        sunset = new Date(sunset.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    // Calculate positions and update display
    const dayDuration = sunset.getTime() - sunrise.getTime();
    const timeFromSunrise = now.getTime() - sunrise.getTime();
    let dayProgress = Math.max(0, Math.min(1, timeFromSunrise / dayDuration));
    
    if (now < sunrise) dayProgress = 0;
    if (now > sunset) dayProgress = 1;

    this.updateArc(dayProgress);
    this.updateSunPosition(dayProgress);
    this.updateTimes(now, sunrise, sunset);
    this.updateStatus(now, sunrise, sunset);
  }

  updateArc(progress) {
    const activeArc = this.shadowRoot.getElementById('active-arc');
    const sunriseX = 50, sunsetX = 350, arcY = 200;
    const centerX = (sunriseX + sunsetX) / 2; // 200
    const centerY = arcY; // 200
    const radius = (sunsetX - sunriseX) / 2; // 150
    
    if (progress === 0) {
      activeArc.setAttribute('d', `M ${sunriseX} ${arcY} A ${radius} ${radius} 0 0 1 ${sunriseX} ${arcY}`);
      activeArc.setAttribute('stroke-dasharray', '0 471.24'); // PI * 150
      return;
    }
    
    // Always draw full arc but use dasharray to show progress
    const largeArcFlag = 1; // Always use large arc for full semicircle
    activeArc.setAttribute('d', `M ${sunriseX} ${arcY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${sunsetX} ${arcY}`);
    
    // Calculate dash array to show only the progress portion
    const arcLength = Math.PI * radius; // Half circumference ≈ 471.24
    const progressLength = arcLength * progress;
    const remainingLength = arcLength - progressLength;
    activeArc.setAttribute('stroke-dasharray', `${progressLength} ${remainingLength}`);
  }

  updateSunPosition(progress) {
    const sunGroup = this.shadowRoot.getElementById('sun-group');
    const sunRays = this.shadowRoot.getElementById('sun-rays');
    
    const sunriseX = 50, sunsetX = 350, arcY = 200;
    const centerX = (sunriseX + sunsetX) / 2; // 200
    const centerY = arcY; // 200
    const radius = (sunsetX - sunriseX) / 2; // 150
    
    // Calculate sun position along the same arc
    const angle = Math.PI * progress; // 0 to PI
    const x = centerX - radius * Math.cos(angle);
    const y = centerY - radius * Math.sin(angle);
    
    sunGroup.setAttribute('transform', `translate(${x}, ${y})`);
    
    // Update sun rays
    sunRays.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const rayAngle = (i * Math.PI * 2) / 8;
      const innerRadius = 16;
      const outerRadius = 24;
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', Math.cos(rayAngle) * innerRadius);
      line.setAttribute('y1', Math.sin(rayAngle) * innerRadius);
      line.setAttribute('x2', Math.cos(rayAngle) * outerRadius);
      line.setAttribute('y2', Math.sin(rayAngle) * outerRadius);
      line.setAttribute('stroke', '#FFD700');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-linecap', 'round');
      
      sunRays.appendChild(line);
    }
  }

  updateTimes(now, sunrise, sunset) {
    const currentTimeEl = this.shadowRoot.getElementById('current-time');
    const sunriseTimeEl = this.shadowRoot.getElementById('sunrise-time');
    const sunsetTimeEl = this.shadowRoot.getElementById('sunset-time');
    
    currentTimeEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    sunriseTimeEl.textContent = sunrise.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    sunsetTimeEl.textContent = sunset.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  updateStatus(now, sunrise, sunset) {
    const statusEl = this.shadowRoot.getElementById('status-message');
    const timeRemainingEl = this.shadowRoot.getElementById('time-remaining');
    
    let status, timeRemaining;
    
    if (now < sunrise) {
      status = 'Before sunrise';
      const diff = sunrise.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      timeRemaining = `${hours}h ${minutes}m until sunrise`;
    } else if (now > sunset) {
      status = 'After sunset';
      const tomorrow = new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      timeRemaining = `${hours}h ${minutes}m until sunrise`;
    } else {
      status = 'Daylight hours';
      const diff = sunset.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      timeRemaining = `${hours}h ${minutes}m until sunset`;
    }
    
    statusEl.textContent = status;
    timeRemainingEl.textContent = timeRemaining;
  }

  disconnectedCallback() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  static getConfigElement() {
    return document.createElement('sun-arc-card-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:sun-arc-card',
      title: 'Sun Position'
    };
  }
}

// Register the custom card
customElements.define('sun-arc-card', SunArcCard);

// Add to custom card registry
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'sun-arc-card',
  name: 'Sun Arc Card',
  description: 'A beautiful sun position tracker with arc visualization',
  preview: true
});

console.info(
  '%c SUN-ARC-CARD %c 1.0.0 ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
