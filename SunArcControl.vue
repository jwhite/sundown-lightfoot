<template>
  <div class="sun-arc-control">
    <div class="sun-arc-container">
      <svg
        :width="svgSize"
        :height="svgSize / 2 + 40"
        viewBox="0 0 400 240"
        class="sun-arc-svg"
      >
        <!-- Background arc (horizon line) -->
        <path
          :d="backgroundArcPath"
          stroke="#e0e0e0"
          stroke-width="4"
          fill="none"
          class="background-arc"
        />
        
        <!-- Active arc (progress from sunrise to current time) -->
        <path
          :d="activeArcPath"
          stroke="url(#sunGradient)"
          stroke-width="6"
          fill="none"
          class="active-arc"
          stroke-linecap="round"
          :stroke-dasharray="activeDashArray"
          :stroke-dashoffset="activeDashOffset"
        />
        
        <!-- Sun icon -->
        <g :transform="`translate(${sunPosition.x}, ${sunPosition.y})`">
          <circle
            r="12"
            fill="url(#sunGradient)"
            class="sun-circle"
          />
          <!-- Sun rays -->
          <g class="sun-rays">
            <line v-for="i in 8" :key="i"
              :x1="rayPositions[i-1].x1"
              :y1="rayPositions[i-1].y1"
              :x2="rayPositions[i-1].x2"
              :y2="rayPositions[i-1].y2"
              stroke="#FFD700"
              stroke-width="2"
              stroke-linecap="round"
            />
          </g>
        </g>
        
        <!-- Sunrise icon -->
        <g transform="translate(50, 200)">
          <circle r="8" fill="#FF6B35" opacity="0.7" />
          <text x="0" y="25" text-anchor="middle" class="time-label">{{ formattedSunrise }}</text>
        </g>
        
        <!-- Sunset icon -->
        <g transform="translate(350, 200)">
          <circle r="8" fill="#FF6B35" opacity="0.7" />
          <text x="0" y="25" text-anchor="middle" class="time-label">{{ formattedSunset }}</text>
        </g>
        
        <!-- Current time display -->
        <text x="200" y="30" text-anchor="middle" class="current-time">{{ formattedCurrentTime }}</text>
        
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
      <p class="status-message">{{ statusMessage }}</p>
      <p class="time-remaining">{{ timeRemaining }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props for Home Assistant integration
const props = defineProps({
  sunriseTime: {
    type: String,
    default: '06:30' // Default sunrise time
  },
  sunsetTime: {
    type: String,
    default: '19:30' // Default sunset time
  },
  timezone: {
    type: String,
    default: 'local'
  }
})

// Reactive data
const currentTime = ref(new Date())
const svgSize = ref(400)

// Update current time every minute
let timeInterval = null

onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 60000) // Update every minute
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// Computed properties for time calculations
const sunriseDate = computed(() => {
  const today = new Date()
  const [hours, minutes] = props.sunriseTime.split(':')
  const sunrise = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
  return sunrise
})

const sunsetDate = computed(() => {
  const today = new Date()
  const [hours, minutes] = props.sunsetTime.split(':')
  const sunset = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
  return sunset
})

const dayDuration = computed(() => {
  return sunsetDate.value.getTime() - sunriseDate.value.getTime()
})

const timeFromSunrise = computed(() => {
  return currentTime.value.getTime() - sunriseDate.value.getTime()
})

const dayProgress = computed(() => {
  if (currentTime.value < sunriseDate.value) return 0
  if (currentTime.value > sunsetDate.value) return 1
  return Math.max(0, Math.min(1, timeFromSunrise.value / dayDuration.value))
})                // Arc calculations - ensure perfect alignment with sunrise/sunset markers
                const sunriseX = 50
                const sunsetX = 350
                const arcY = 200
                const centerX = (sunriseX + sunsetX) / 2 // 200
                const centerY = arcY // 200
                const radius = (sunsetX - sunriseX) / 2 // 150

                const backgroundArcPath = computed(() => {
                  return `M ${sunriseX} ${arcY} A ${radius} ${radius} 0 0 1 ${sunsetX} ${arcY}`
                })

                const activeArcPath = computed(() => {
                  if (dayProgress.value === 0) {
                    return `M ${sunriseX} ${arcY} A ${radius} ${radius} 0 0 1 ${sunriseX} ${arcY}`
                  }
                  
                  // The active arc should always go from sunrise to sunset (full arc)
                  // but only be visible up to the current progress
                  const largeArcFlag = 1 // Always use large arc for full semicircle
                  return `M ${sunriseX} ${arcY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${sunsetX} ${arcY}`
                })

                // Calculate dash array to show only the progress portion
                const arcLength = Math.PI * radius // Half circumference
                const activeDashArray = computed(() => {
                  const progressLength = arcLength * dayProgress.value
                  const remainingLength = arcLength - progressLength
                  return `${progressLength} ${remainingLength}`
                })

                const activeDashOffset = computed(() => {
                  return 0
                })

                const sunPosition = computed(() => {
                  // Calculate sun position along the same arc
                  const angle = Math.PI * dayProgress.value // 0 to PI
                  const x = centerX - radius * Math.cos(angle)
                  const y = centerY - radius * Math.sin(angle)
                  return { x, y }
                })

// Sun rays positions
const rayPositions = computed(() => {
  const rays = []
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8
    const innerRadius = 16
    const outerRadius = 24
    rays.push({
      x1: Math.cos(angle) * innerRadius,
      y1: Math.sin(angle) * innerRadius,
      x2: Math.cos(angle) * outerRadius,
      y2: Math.sin(angle) * outerRadius
    })
  }
  return rays
})

// Formatted time strings
const formattedCurrentTime = computed(() => {
  return currentTime.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
})

const formattedSunrise = computed(() => {
  return sunriseDate.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
})

const formattedSunset = computed(() => {
  return sunsetDate.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
})

// Status message
const statusMessage = computed(() => {
  if (currentTime.value < sunriseDate.value) {
    return 'Before sunrise'
  } else if (currentTime.value > sunsetDate.value) {
    return 'After sunset'
  } else {
    return 'Daylight hours'
  }
})

const timeRemaining = computed(() => {
  if (currentTime.value < sunriseDate.value) {
    const diff = sunriseDate.value.getTime() - currentTime.value.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m until sunrise`
  } else if (currentTime.value > sunsetDate.value) {
    const tomorrow = new Date(sunriseDate.value.getTime() + 24 * 60 * 60 * 1000)
    const diff = tomorrow.getTime() - currentTime.value.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m until sunrise`
  } else {
    const diff = sunsetDate.value.getTime() - currentTime.value.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m until sunset`
  }
})
</script>

<style scoped>
.sun-arc-control {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 20px;
  color: white;
  font-family: 'Arial', sans-serif;
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

/* Responsive design */
@media (max-width: 600px) {
  .sun-arc-control {
    padding: 15px;
  }
  
  .current-time {
    font-size: 16px;
  }
  
  .status-message {
    font-size: 14px;
  }
  
  .time-remaining {
    font-size: 12px;
  }
}
</style>
