const telegramUsername = "Ada778877";
const telegramBaseURL = `https://t.me/${telegramUsername}`;

const courses = [
    {
        id: "spanish",
        name: "دورة اللغة الإسبانية",
        icon: "🇪🇸",
        subtitle: "تعلم اللغة الإسبانية من الصفر حتى الاحتراف",
        features: [
            "دروس تفاعلية مع مدربين متخصصين",
            "محادثات يومية وتمارين عملية",
            "شهادة معتمدة عند إتمام الدورة",
            "دعم مستمر عبر تليجرام"
        ],
        price: "299",
        currency: "ريال",
        message: "مرحباً، أريد الاشتراك في دورة اللغة الإسبانية"
    },
    {
        id: "english",
        name: "دورة اللغة الإنجليزية",
        icon: "🇬🇧",
        subtitle: "طور مهاراتك في اللغة الإنجليزية للعمل والسفر",
        features: [
            "مستويات من المبتدئ إلى المتقدم",
            "تدريب على المحادثة والاستماع",
            "مواد تعليمية شاملة",
            "اختبارات تقييم دورية"
        ],
        price: "349",
        currency: "ريال",
        message: "مرحباً، أريد الاشتراك في دورة اللغة الإنجليزية"
    },
    {
        id: "french",
        name: "دورة اللغة الفرنسية",
        icon: "🇫🇷",
        subtitle: "اكتشف جمال اللغة الفرنسية وثقافتها",
        features: [
            "منهج متكامل للمبتدئين",
            "تعلم النطق الصحيح",
            "قواعد اللغة بأسلوب مبسط",
            "تمارين كتابية وشفهية"
        ],
        price: "279",
        currency: "ريال",
        message: "مرحباً، أريد الاشتراك في دورة اللغة الفرنسية"
    },
    {
        id: "programming",
        name: "دورة البرمجة",
        icon: "💻",
        subtitle: "ابدأ مسيرتك في عالم البرمجة وتطوير التطبيقات",
        features: [
            "تعلم أساسيات البرمجة",
            "مشاريع عملية تطبيقية",
            "لغات برمجة متعددة",
            "إرشاد مهني متخصص"
        ],
        price: "399",
        currency: "ريال",
        message: "مرحباً، أريد الاشتراك في دورة البرمجة"
    },
    {
        id: "design",
        name: "دورة التصميم الجرافيكي",
        icon: "🎨",
        subtitle: "أطلق إبداعك وتعلم أدوات التصميم الاحترافية",
        features: [
            "أساسيات التصميم والألوان",
            "برامج Adobe الاحترافية",
            "تصميم الشعارات والهوية البصرية",
            "بناء معرض أعمال احترافي"
        ],
        price: "329",
        currency: "ريال",
        message: "مرحباً، أريد الاشتراك في دورة التصميم الجرافيكي"
    },
    {
        id: "marketing",
        name: "دورة التسويق الرقمي",
        icon: "📱",
        subtitle: "تعلم استراتيجيات التسويق الرقمي الحديثة",
        features: [
            "التسويق عبر وسائل التواصل",
            "إعلانات جوجل وفيسبوك",
            "تحليل البيانات والتقارير",
            "بناء خطة تسويقية متكاملة"
        ],
        price: "359",
        currency: "ريال",
        message: "مرحباً، أريد الاشتراك في دورة التسويق الرقمي"
    }
];

function buildTelegramLink(message) {
    return `${telegramBaseURL}?text=${encodeURIComponent(message)}`;
}

function renderCourses() {
    const grid = document.getElementById('coursesGrid');
    
    grid.innerHTML = courses.map(course => `
        <div class="course-card">
            <div class="course-card-header">
                <span class="course-icon">${course.icon}</span>
                <h3>${course.name}</h3>
                <p class="course-subtitle">${course.subtitle}</p>
            </div>
            <div class="course-card-body">
                <ul class="course-features">
                    ${course.features.map(f => `
                        <li>
                            <span class="feature-icon">✓</span>
                            <span>${f}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="course-card-footer">
                <div class="course-price">
                    <span class="price-value">${course.price} ${course.currency}</span>
                    <span class="price-label">رسوم الدورة الكاملة</span>
                </div>
                <button class="start-btn" data-course-id="${course.id}" onclick="handleStartClick('${course.id}')">
                    ابدأ الآن
                </button>
            </div>
        </div>
    `).join('');
}

function handleStartClick(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('show');

    const orderData = {
        id: Date.now(),
        courseId: course.id,
        courseName: course.name,
        price: `${course.price} ${course.currency}`,
        timestamp: new Date().toLocaleString('ar-SA'),
        status: 'pending'
    };

    try {
        const orders = JSON.parse(localStorage.getItem('course_orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('course_orders', JSON.stringify(orders));
    } catch (e) {
        console.error('خطأ في حفظ الطلب:', e);
    }

    const telegramLink = buildTelegramLink(course.message);

    setTimeout(() => {
        window.open(telegramLink, '_blank');
        overlay.classList.remove('show');
    }, 1200);
}

document.addEventListener('DOMContentLoaded', function() {
    renderCourses();
    console.log('صفحة الدورات جاهزة');
    console.log('حساب تليجرام:', telegramBaseURL);
});
