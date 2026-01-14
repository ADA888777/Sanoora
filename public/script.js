// بيانات النظام
const telegramUsername = "@Ada778877";
const telegramURL = `https://t.me/${telegramUsername.replace('@', '')}`;
let selectedPaymentMethod = null;

// عناصر الواجهة
const paymentOptions = document.querySelectorAll('.payment-option');
const confirmBtn = document.getElementById('confirmBtn');
const loadingElement = document.getElementById('loading');
const userNameInput = document.getElementById('userName');
const userEmailInput = document.getElementById('userEmail');
const errorMessage = document.getElementById('errorMessage');
const ordersSection = document.getElementById('ordersSection');
const ordersList = document.getElementById('ordersList');

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// عرض رسالة خطأ
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 4000);
}

// التحقق من صحة النموذج
function validateForm() {
    let isValid = true;
    
    // إعادة تعيين الحالة
    userNameInput.classList.remove('invalid');
    userEmailInput.classList.remove('invalid');
    
    // التحقق من الاسم
    if (!userNameInput.value.trim()) {
        userNameInput.classList.add('invalid');
        isValid = false;
    }
    
    // التحقق من البريد
    if (!userEmailInput.value.trim() || !isValidEmail(userEmailInput.value.trim())) {
        userEmailInput.classList.add('invalid');
        isValid = false;
    }
    
    return isValid;
}

// تحديث حالة زر التأكيد
function updateConfirmButton() {
    const hasName = userNameInput.value.trim().length > 0;
    const hasEmail = userEmailInput.value.trim().length > 0 && isValidEmail(userEmailInput.value.trim());
    const hasPayment = selectedPaymentMethod !== null;
    
    confirmBtn.disabled = !(hasName && hasEmail && hasPayment);
    
    if (selectedPaymentMethod) {
        confirmBtn.textContent = selectedPaymentMethod === 'apple-pay' 
            ? 'المتابعة إلى تليجرام (Apple Pay)' 
            : 'المتابعة إلى تليجرام (التحويل البنكي)';
    }
}

// اختيار طريقة الدفع
paymentOptions.forEach(option => {
    option.addEventListener('click', function() {
        // إزالة التحديد من جميع الخيارات
        paymentOptions.forEach(opt => opt.classList.remove('selected'));
        
        // تحديد الخيار الحالي
        this.classList.add('selected');
        selectedPaymentMethod = this.getAttribute('data-method');
        
        // تحديث زر التأكيد
        updateConfirmButton();
    });
});

// الاستماع لتغييرات حقول الإدخال
userNameInput.addEventListener('input', function() {
    this.classList.remove('invalid');
    updateConfirmButton();
});

userEmailInput.addEventListener('input', function() {
    this.classList.remove('invalid');
    updateConfirmButton();
});

// تأكيد طريقة الدفع والانتقال إلى تليجرام
confirmBtn.addEventListener('click', function() {
    if (!selectedPaymentMethod) return;
    
    // التحقق من صحة النموذج
    if (!validateForm()) {
        showError('الرجاء تعبئة جميع الحقول المطلوبة بشكل صحيح');
        return;
    }
    
    // إظهار رسالة التحميل
    confirmBtn.style.display = 'none';
    loadingElement.style.display = 'block';
    
    // بيانات المستخدم
    const userData = {
        name: userNameInput.value.trim(),
        email: userEmailInput.value.trim(),
        method: selectedPaymentMethod === 'apple-pay' ? "Apple Pay" : "التحويل البنكي",
        timestamp: new Date().toLocaleString('ar-SA'),
        course: "الدورة التعليمية",
        price: "XXX ريال"
    };
    
    // إعداد رسالة Telegram
    let telegramMessage = `🔔 طلب شراء جديد - ${userData.method}\n\n`;
    telegramMessage += `👤 الاسم: ${userData.name}\n`;
    telegramMessage += `📧 البريد: ${userData.email}\n`;
    telegramMessage += `💰 طريقة الدفع: ${userData.method}\n`;
    telegramMessage += `💵 المبلغ: ${userData.price}\n`;
    telegramMessage += `📚 المنتج: ${userData.course}\n`;
    telegramMessage += `📅 الوقت: ${userData.timestamp}\n\n`;
    telegramMessage += `📍 تم إرسال هذا الطلب من موقع الويب`;
    
    // تشفير الرسالة للتضمين في الرابط
    const encodedMessage = encodeURIComponent(telegramMessage);
    
    // حفظ البيانات محلياً
    saveOrderLocally(userData);
    
    // الانتقال إلى Telegram مع الرسالة بعد تأخير بسيط
    setTimeout(() => {
        window.location.href = `${telegramURL}?text=${encodedMessage}`;
    }, 1500);
});

// دالة لحفظ الطلب محلياً (للتتبع)
function saveOrderLocally(orderData) {
    try {
        const orders = JSON.parse(localStorage.getItem('course_orders') || '[]');
        orderData.id = Date.now();
        orderData.status = 'pending';
        orders.push(orderData);
        localStorage.setItem('course_orders', JSON.stringify(orders));
        console.log('تم حفظ الطلب محلياً:', orderData);
    } catch (error) {
        console.error('خطأ في حفظ الطلب:', error);
    }
}

// دالة لعرض الطلبات المحفوظة
function displaySavedOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem('course_orders') || '[]');
        
        if (orders.length === 0) {
            ordersSection.classList.remove('show');
            return;
        }
        
        ordersSection.classList.add('show');
        ordersList.innerHTML = '';
        
        // عرض آخر 5 طلبات فقط
        const recentOrders = orders.slice(-5).reverse();
        
        recentOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="order-header">
                    <span class="order-method">${order.method}</span>
                    <span class="order-status">قيد الانتظار</span>
                </div>
                <div class="order-details">
                    ${order.name} - ${order.email}
                </div>
                <div class="order-time">${order.timestamp}</div>
            `;
            ordersList.appendChild(orderItem);
        });
    } catch (error) {
        console.error('خطأ في عرض الطلبات:', error);
    }
}

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('نظام الدفع جاهز للاستخدام');
    console.log('سيتم توجيه جميع المستخدمين إلى:', telegramURL);
    
    // عرض الطلبات المحفوظة
    displaySavedOrders();
});
