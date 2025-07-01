# Sun Arc Control for Home Assistant

A beautiful Vue.js component that displays the sun's position throughout the day as an arc from sunrise to sunset. Perfect for Home Assistant dashboards.

![Sun Arc Control Demo](https://img.shields.io/badge/Vue-3.5.17-4FC08D?style=flat&logo=vue.js&logoColor=white)
![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Compatible-41BDF5?style=flat&logo=homeassistant&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

- **🌅 Visual Sun Position**: Shows the sun's current position on a semicircular arc
- **⏰ Real-time Updates**: Updates every minute to reflect the current time
- **🌟 Animated Sun**: Pulsing sun icon with rotating rays
- **📅 Time Display**: Shows current time, sunrise, and sunset times
- **📊 Status Information**: Displays whether it's before sunrise, during daylight, or after sunset
- **⏳ Time Remaining**: Shows time until next sunrise or sunset
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🎨 Beautiful Styling**: Gradient backgrounds and smooth animations
- **🏠 Home Assistant Ready**: Plug-and-play integration with Home Assistant

## 🚀 Quick Start

### Demo
Open `demo.html` in your browser to see the component in action. You can adjust the sunrise and sunset times using the controls to test different scenarios.

### Integration Options

#### Option 1: Vue Component (Recommended for Vue Projects)
```vue
<template>
  <SunArcControl 
    :sunrise-time="sunriseTime"
    :sunset-time="sunsetTime"
  />
</template>

<script>
import SunArcControl from './SunArcControl.vue'

export default {
  components: { SunArcControl },
  data() {
    return {
      sunriseTime: '06:30',
      sunsetTime: '19:30'
    }
  }
}
</script>
```

#### Option 2: Home Assistant Custom Card
1. Copy `sun-arc-card.js` to your `www/` folder
2. Add it as a resource in your dashboard
3. Add the card with type `custom:sun-arc-card`

```yaml
type: custom:sun-arc-card
title: Sun Position
```

## 📁 Files

- `SunArcControl.vue` - Main Vue 3 component (Composition API)
- `demo.html` - Standalone demo page for testing
- `sun-arc-card.js` - Home Assistant custom card implementation
- `package.json` - NPM package configuration
- `README.md` - This documentation

## 🔧 Configuration

The component accepts these props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sunriseTime` | String | `"06:30"` | Sunrise time in HH:MM format |
| `sunsetTime` | String | `"19:30"` | Sunset time in HH:MM format |
| `timezone` | String | `"local"` | Timezone for calculations |

## 🏠 Home Assistant Integration

### Automatic Data Integration

The custom card automatically:
- ✅ Fetches sunrise/sunset times from your `sun.sun` entity
- ✅ Updates every minute with current time
- ✅ Calculates precise sun position based on time progression
- ✅ Shows beautiful visual feedback with animations

### Manual Configuration

```javascript
// Example of accessing Home Assistant sun data
const sunEntity = hass.states['sun.sun'];
const sunrise = new Date(sunEntity.attributes.next_rising);
const sunset = new Date(sunEntity.attributes.next_setting);

// Format for component
const sunriseTime = sunrise.toTimeString().slice(0, 5); // "06:30"
const sunsetTime = sunset.toTimeString().slice(0, 5);   // "19:30"
```

## 🎨 Customization

### Colors & Themes
Modify the CSS variables to match your Home Assistant theme:

```css
.sun-arc-control {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Customize gradient colors */
}

/* Sun gradient */
#sunGradient stop {
  stop-color: #FFD700; /* Change sun colors */
}
```

### Animation Speeds
Adjust animation timing:

```css
.sun-rays {
  animation: rotate 20s linear infinite; /* Ray rotation speed */
}

.sun-circle {
  animation: pulse 2s ease-in-out infinite; /* Pulse speed */
}
```

### Arc Appearance
Customize the arc styling:

```css
.active-arc {
  stroke-width: 6; /* Arc thickness */
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6)); /* Glow effect */
}
```

## 🔬 Technical Details

### Arc Mathematics
The component uses precise mathematical calculations:

- **Arc Path**: SVG path from sunrise (50, 200) to sunset (350, 200)
- **Sun Position**: Calculated using `Math.PI * dayProgress` for smooth movement
- **Progress Visualization**: Uses `stroke-dasharray` to show time progression
- **Perfect Alignment**: All elements use the same coordinate system for precision

### Performance
- ⚡ Lightweight: No external dependencies except Vue.js
- 🔄 Efficient updates: Only recalculates when time changes
- 📱 Responsive: Scales beautifully on all screen sizes
- 🎯 Optimized: Uses CSS animations for smooth performance

## 🌐 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## 🚀 Development

### Prerequisites
- Node.js 14+ (for development tools)
- Modern browser with ES6 support
- Home Assistant (for integration testing)

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open demo.html in browser
open demo.html
```

### Testing with Home Assistant
1. Copy files to your Home Assistant `www/` directory
2. Add as custom card resource
3. Test with your real sunrise/sunset data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Guidelines
- Follow Vue 3 Composition API patterns
- Maintain responsive design principles
- Test with various sunrise/sunset times
- Ensure Home Assistant compatibility

## 📄 License

MIT License - feel free to use in your Home Assistant setup!

## 🎯 Future Enhancements

- [ ] Multiple timezone support
- [ ] Weather integration (cloudy/sunny indicators)
- [ ] Seasonal arc variations
- [ ] Custom color themes
- [ ] Additional animation effects
- [ ] Solar noon indicator

## 🙏 Acknowledgments

Built with ❤️ for the Home Assistant community using:
- Vue.js 3.5.17
- SVG animations
- CSS gradients and modern web standards

Perfect for creating an elegant sun tracking display in your Home Assistant dashboard! 🌅🏠
