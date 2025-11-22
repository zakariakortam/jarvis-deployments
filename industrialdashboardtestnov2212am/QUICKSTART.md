# 🚀 Quick Start Guide - Industrial Dashboard

Get your industrial dashboard running in under 5 minutes!

## ⚡ Fast Track (Development)

```bash
# Navigate to project
cd /home/facilis/workspace/storage/piUaoikOYFercIkS3h1a5G5fREk2/projects/industrial-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser to `http://localhost:3000` and you're done! 🎉

## 🐳 Docker Quick Start

```bash
# Build image
docker build -t industrial-dashboard .

# Run container
docker run -d -p 8080:80 industrial-dashboard

# Access at http://localhost:8080
```

## ✅ Validation Before Deploy

```bash
# Run validation script
./validate-deployment.sh
```

This checks:
- All required files present
- Configuration correct
- Build successful
- Bundle optimized
- Ready for deployment

## 📱 What You'll See

Once running, the dashboard shows:

1. **Header** - System stats (100 units: operational/warning/critical/offline)
2. **Overview Cards** - System health, avg temperature, total power, efficiency
3. **Temperature Chart** - Real-time multi-line chart (5 equipment units)
4. **Power Chart** - Top 10 equipment by power consumption
5. **Voltage Gauges** - 6 real-time voltage monitors with thresholds
6. **Vibration Chart** - Area chart with warning/critical thresholds
7. **Alert Panel** - Recent alerts with severity indicators
8. **Production Table** - Sortable/filterable data for all 100 units

## 🎮 Interactive Features

### Try These:
- **Theme Toggle** - Click sun/moon icon in header
- **Export Data** - Click download icon to export CSV
- **Sort Table** - Click any column header to sort
- **Filter** - Click filter icon to filter by status/location/type
- **Search** - Type in search box to find equipment

## 📊 Live Data

All data updates **every second**:
- 100 equipment units
- 6 metrics per unit (temperature, voltage, vibration, power, cycles, throughput)
- Realistic patterns with noise and trends
- Automatic alerts when thresholds exceeded

## 🎨 Customization

### Change Update Speed
Edit `src/store/dashboardStore.js`:
```javascript
updateInterval: 1000, // Change to 500 for 0.5s, 2000 for 2s
```

### Change Equipment Count
Edit `src/services/sensorDataGenerator.js`:
```javascript
this.equipment = this.generateEquipment(100); // Change 100 to 50, 200, etc.
```

### Change Alert Thresholds
Edit `src/services/sensorDataGenerator.js`:
```javascript
if (readings.temperature > 85) { // Change 85 to your threshold
  // Temperature warning
}
```

## 🌐 Deployment Options

### Option 1: Coolify (Recommended)
1. Push code to Git
2. Create app in Coolify
3. Connect repository
4. Deploy (auto-detects Docker)

### Option 2: Vercel
```bash
npm install -g vercel
vercel
```

### Option 3: Netlify
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Option 4: DigitalOcean
- Upload to App Platform
- Set build: `npm run build`
- Set output: `dist`

## 🆘 Troubleshooting

### Issue: Blank Page After Build
**Solution**: Verify `vite.config.js` has `base: './'`

### Issue: Dependencies Won't Install
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build Fails
**Solution**: Check Node.js version
```bash
node --version  # Should be 18+
```

### Issue: Port 3000 Already in Use
**Solution**: Change port in `vite.config.js`:
```javascript
server: {
  port: 3001, // Change to any available port
  host: true
}
```

## 📚 More Information

- **Full Documentation**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Project Summary**: See `PROJECT_SUMMARY.md`

## 🎯 Production Checklist

Before deploying to production:

- [ ] Run `./validate-deployment.sh`
- [ ] Check all validation passes
- [ ] Test locally with `npm run preview`
- [ ] Verify data updates in real-time
- [ ] Test on mobile devices
- [ ] Test dark/light mode toggle
- [ ] Test data export
- [ ] Test filtering and search

## 💡 Tips

1. **Performance**: The app handles 100+ equipment units efficiently with circular buffers
2. **Mobile**: Fully responsive, works great on tablets and phones
3. **Data**: All data is simulated - replace with real API calls for production
4. **Theme**: Dark mode is default, but light mode is available
5. **Export**: CSV export includes all filtered data

## 🎉 You're Ready!

Your industrial dashboard is now running and monitoring 100 equipment units in real-time.

**Questions?** Check the full documentation in README.md

---

**Quick Start Complete** ✅ | **Enjoy your dashboard!** 🚀
