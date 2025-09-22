const translations = {
    en: {
        // Header
        'main-title': 'Patient Monitoring Dashboard',
        'status-text': 'System Online',
        
        // Vitals Section
        'vitals-title': 'Live Patient Vitals',
        'active-patients': 'Active Patients: 12',
        'hr-label': 'Heart Rate (BPM)',
        'o2-label': 'Oxygen Level (%)',
        'temp-label': 'Temperature (°C)',
        'bp-label': 'Blood Pressure',
        
        // Charts
        'trends-title': 'Vital Signs Trends',
        'stability-title': 'Patient Stability Scores',
        'critical-label': 'Critical',
        'stable-label': 'Stable',
        'recovery-label': 'Recovery',
        'medication-title': 'Medication Usage Distribution',
        'costs-title': 'Treatment Costs Overview',
        'daily-label': 'Daily Cost',
        'monthly-label': 'Monthly Total',
        'avg-label': 'Avg per Patient',
        
        // Patient Table
        'patients-title': 'Patient Data Table',
        'th-id': 'Patient ID',
        'th-name': 'Name',
        'th-age': 'Age',
        'th-status': 'Status',
        'th-hr': 'HR',
        'th-o2': 'O2',
        'th-temp': 'Temp',
        'th-cost': 'Cost',
        
        // Footer
        'footer-text': '© 2025 MedTech Solutions - Patient Monitoring System v2.1.0',
        'data-points': 'Data Points:',
        'last-update': 'Last Update:',
        
        // Status values
        'critical': 'Critical',
        'stable': 'Stable',
        'recovery': 'Recovery',
        
        // Time ranges
        'last-hour': 'Last Hour',
        'last-6-hours': 'Last 6 Hours',
        'last-24-hours': 'Last 24 Hours',
        
        // Search and filters
        'search-placeholder': 'Search patients...',
        'all-status': 'All Status',
        
        // Chart labels
        'heart-rate-chart': 'Heart Rate (BPM)',
        'oxygen-chart': 'Oxygen Level (%)',
        'temperature-chart': 'Temperature (°C)',
        'systolic-bp-chart': 'Systolic BP',
        'time-axis': 'Time',
        'cost-axis': 'Cost (¥)',
        'date-axis': 'Date',
        
        // Medication labels
        'antibiotics': 'Antibiotics',
        'painkillers': 'Pain Relief',
        'cardiac': 'Cardiac',
        'respiratory': 'Respiratory',
        'supplements': 'Supplements',
        'other': 'Other'
    },
    ja: {
        // Header
        'main-title': '患者監視ダッシュボード',
        'status-text': 'システム稼働中',
        
        // Vitals Section
        'vitals-title': 'リアルタイム患者バイタル',
        'active-patients': '対象患者数：12名',
        'hr-label': '心拍数 (BPM)',
        'o2-label': '酸素レベル (%)',
        'temp-label': '体温 (°C)',
        'bp-label': '血圧',
        
        // Charts
        'trends-title': 'バイタルサインの推移',
        'stability-title': '患者安定性スコア',
        'critical-label': '重症',
        'stable-label': '安定',
        'recovery-label': '回復',
        'medication-title': '薬物使用分布',
        'costs-title': '治療費概要',
        'daily-label': '日間コスト',
        'monthly-label': '月間合計',
        'avg-label': '患者平均',
        
        // Patient Table
        'patients-title': '患者データテーブル',
        'th-id': '患者ID',
        'th-name': '氏名',
        'th-age': '年齢',
        'th-status': '状態',
        'th-hr': '心拍',
        'th-o2': '酸素',
        'th-temp': '体温',
        'th-cost': 'コスト',
        
        // Footer
        'footer-text': '© 2025 メドテック・ソリューション - 患者監視システム v2.1.0',
        'data-points': 'データポイント:',
        'last-update': '最終更新:',
        
        // Status values
        'critical': '重症',
        'stable': '安定',
        'recovery': '回復',
        
        // Time ranges
        'last-hour': '過去1時間',
        'last-6-hours': '過去6時間',
        'last-24-hours': '過去24時間',
        
        // Search and filters
        'search-placeholder': '患者を検索...',
        'all-status': 'すべての状態',
        
        // Chart labels
        'heart-rate-chart': '心拍数 (BPM)',
        'oxygen-chart': '酸素レベル (%)',
        'temperature-chart': '体温 (°C)',
        'systolic-bp-chart': '最高血圧',
        'time-axis': '時間',
        'cost-axis': 'コスト (¥)',
        'date-axis': '日付',
        
        // Medication labels
        'antibiotics': '抗生物質',
        'painkillers': '鎮痛剤',
        'cardiac': '心臓薬',
        'respiratory': '呼吸器薬',
        'supplements': 'サプリメント',
        'other': 'その他'
    }
};

class TranslationManager {
    constructor() {
        this.currentLang = 'en';
        this.initializeLanguageButtons();
    }

    initializeLanguageButtons() {
        document.getElementById('lang-en').addEventListener('click', () => {
            this.switchLanguage('en');
        });
        
        document.getElementById('lang-ja').addEventListener('click', () => {
            this.switchLanguage('ja');
        });
    }

    switchLanguage(lang) {
        this.currentLang = lang;
        
        // Update button states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${lang}`).classList.add('active');
        
        // Apply translations to static elements
        this.applyTranslations();
        
        // Update chart labels
        this.updateChartLabels();
        
        // Update patient table
        this.updatePatientTable();
        
        // Update dropdown options
        this.updateDropdownOptions();
    }

    applyTranslations() {
        const t = translations[this.currentLang];
        
        // Update all elements with IDs that have translations
        Object.keys(t).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = t[key];
                } else {
                    element.textContent = t[key];
                }
            }
        });
        
        // Update gauge labels with current counts
        if (window.dataGenerator) {
            const statusCounts = window.dataGenerator.getStatusCounts();
            document.getElementById('critical-label').textContent = `${t['critical-label']} (${statusCounts.critical})`;
            document.getElementById('stable-label').textContent = `${t['stable-label']} (${statusCounts.stable})`;
            document.getElementById('recovery-label').textContent = `${t['recovery-label']} (${statusCounts.recovery})`;
        }
    }

    updateChartLabels() {
        const t = translations[this.currentLang];
        
        // Update vitals chart labels
        if (window.chartManager && window.chartManager.charts.vitals) {
            const chart = window.chartManager.charts.vitals;
            chart.data.datasets[0].label = t['heart-rate-chart'];
            chart.data.datasets[1].label = t['oxygen-chart'];
            chart.data.datasets[2].label = t['temperature-chart'];
            chart.data.datasets[3].label = t['systolic-bp-chart'];
            
            chart.options.scales.x.title.text = t['time-axis'];
            chart.options.scales.y.title.text = `${t['heart-rate-chart']} / ${t['systolic-bp-chart']}`;
            
            chart.update('none');
        }
        
        // Update medication chart labels
        if (window.chartManager && window.chartManager.charts.medication) {
            const chart = window.chartManager.charts.medication;
            chart.data.labels = [
                t['antibiotics'],
                t['painkillers'],
                t['cardiac'],
                t['respiratory'],
                t['supplements'],
                t['other']
            ];
            
            chart.update('none');
        }
        
        // Update costs chart labels
        if (window.chartManager && window.chartManager.charts.costs) {
            const chart = window.chartManager.charts.costs;
            chart.options.scales.x.title.text = t['date-axis'];
            chart.options.scales.y.title.text = t['cost-axis'];
            
            chart.update('none');
        }
    }

    updatePatientTable() {
        if (window.patientTableManager) {
            window.patientTableManager.renderTable();
        }
    }

    updateDropdownOptions() {
        const t = translations[this.currentLang];
        
        // Update time range options
        const timeRange = document.getElementById('time-range');
        timeRange.options[0].text = t['last-hour'];
        timeRange.options[1].text = t['last-6-hours'];
        timeRange.options[2].text = t['last-24-hours'];
        
        // Update status filter options
        const statusFilter = document.getElementById('filter-status');
        statusFilter.options[0].text = t['all-status'];
        statusFilter.options[1].text = t['critical'];
        statusFilter.options[2].text = t['stable'];
        statusFilter.options[3].text = t['recovery'];
    }

    getTranslation(key) {
        return translations[this.currentLang][key] || key;
    }

    getCurrentLanguage() {
        return this.currentLang;
    }
}

// Initialize translation manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.translationManager = new TranslationManager();
});