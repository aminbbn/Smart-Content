import React from 'react';
import { AppView } from '../types';

interface Props {
  view: AppView;
  onNavigate: (view: AppView) => void;
}

export default function InfoPage({ view, onNavigate }: Props) {
  
  const getPageData = () => {
    switch(view) {
      case 'updates': return {
        title: 'بروزرسانی‌ها',
        subtitle: 'مسیر توسعه و پیشرفت پلتفرم',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 01-2-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
        gradient: 'from-blue-600 to-indigo-600'
      };
      case 'blog': return {
        title: 'وبلاگ',
        subtitle: 'آخرین مقالات و اخبار دنیای هوش مصنوعی',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
        gradient: 'from-purple-600 to-pink-600'
      };
      case 'guide': return {
        title: 'راهنما',
        subtitle: 'آموزش گام‌به‌گام استفاده از سیستم',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        gradient: 'from-emerald-600 to-teal-600'
      };
      case 'support': return {
        title: 'پشتیبانی',
        subtitle: 'مرکز پاسخگویی و ارتباط با ما',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        gradient: 'from-amber-500 to-orange-600'
      };
      case 'api': return {
        title: 'API مستندات',
        subtitle: 'راهنمای توسعه‌دهندگان و ادغام',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
        gradient: 'from-slate-700 to-slate-900'
      };
      case 'privacy': return {
        title: 'حریم خصوصی',
        subtitle: 'قوانین حفاظت از داده‌های کاربران',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
        gradient: 'from-blue-800 to-slate-900'
      };
      case 'terms': return {
        title: 'قوانین و مقررات',
        subtitle: 'شرایط استفاده از خدمات',
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
        gradient: 'from-slate-600 to-slate-800'
      };
      default: return { title: '', subtitle: '', icon: null, gradient: 'from-gray-500 to-gray-700' };
    }
  };

  const pageInfo = getPageData();

  const renderContent = () => {
    switch(view) {
        case 'updates': 
            return (
                <div className="space-y-12 relative">
                    <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-slate-200 hidden md:block"></div>
                    
                    <div className="relative pl-0 md:pl-16">
                        <div className="hidden md:flex absolute left-6 top-0 w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-sm items-center justify-center z-10"></div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4 inline-block">نسخه ۲.۵ (جاری)</span>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">ادغام با مدل Gemini Pro</h3>
                            <p className="text-slate-600 leading-relaxed">
                                در این نسخه ما موتور اصلی تولید محتوا را به جدیدترین مدل گوگل یعنی Gemini Pro ارتقا دادیم. این تغییر باعث شده است که:
                            </p>
                            <ul className="mt-4 space-y-2 text-slate-600 list-disc list-inside">
                                <li>قابلیت استدلال و درک مطلب تا ۴۰٪ بهبود یافته است.</li>
                                <li>سرعت تولید محتوا به طور چشمگیری افزایش یافته است.</li>
                                <li>داشبورد مانیتورینگ بلادرنگ برای رصد وضعیت سیستم اضافه شده است.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="relative pl-0 md:pl-16">
                        <div className="hidden md:flex absolute left-6 top-0 w-5 h-5 bg-slate-300 rounded-full border-4 border-white z-10"></div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 opacity-80 hover:opacity-100 transition-all">
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full mb-4 inline-block">نسخه ۲.۰</span>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">سیستم مدیریت نویسندگان</h3>
                            <p className="text-slate-600 leading-relaxed">
                                امکان تعریف پرسونای اختصاصی برای هر نویسنده و تنظیم لحن برند. حالا می‌توانید نویسندگانی با سبک‌های مختلف (رسمی، دوستانه، طنز و...) بسازید.
                            </p>
                        </div>
                    </div>

                    <div className="relative pl-0 md:pl-16">
                        <div className="hidden md:flex absolute left-6 top-0 w-5 h-5 bg-slate-300 rounded-full border-4 border-white z-10"></div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 opacity-60 hover:opacity-100 transition-all">
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full mb-4 inline-block">نسخه ۱.۰</span>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">انتشار اولیه</h3>
                            <p className="text-slate-600 leading-relaxed">
                                راه‌اندازی موتور تولید محتوای پایه و ایجنت اخبار.
                            </p>
                        </div>
                    </div>
                </div>
            );
        
        case 'blog':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group cursor-pointer hover:-translate-y-2 duration-300">
                            <div className="h-48 bg-slate-200 relative overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br opacity-80 ${i % 2 === 0 ? 'from-blue-400 to-indigo-500' : 'from-purple-400 to-pink-500'}`}></div>
                                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-800">
                                    آموزش
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-lg text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">چگونه استراتژی محتوای خود را با هوش مصنوعی متحول کنیم؟</h3>
                                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-4">
                                    در این مقاله به بررسی راهکارهای نوین استفاده از مدل‌های زبانی بزرگ در بازاریابی محتوایی می‌پردازیم و نشان می‌دهیم چگونه می‌توانید با ابزارهای خودکار، ترافیک سایت خود را افزایش دهید.
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 pt-4">
                                    <span>۵ دقیقه مطالعه</span>
                                    <span>۱۴۰۳/۰۸/۲۰</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );

        case 'guide':
            return (
                <div className="max-w-3xl mx-auto space-y-12">
                    <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                        <h3 className="text-xl font-bold text-blue-800 mb-4">خوش آمدید!</h3>
                        <p className="text-blue-700 leading-relaxed">
                            این راهنما به شما کمک می‌کند تا در کمترین زمان ممکن، اولین محتوای خود را با استفاده از اسمارت کانتنت تولید کنید.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">1</div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-800 mb-2">تعریف هویت برند</h4>
                                <p className="text-slate-600 leading-relaxed">
                                    اولین قدم، شناساندن کسب‌وکارتان به هوش مصنوعی است. به بخش <strong>تنظیمات شرکت</strong> بروید و نام، حوزه فعالیت و لحن مورد نظر خود را وارد کنید. هر چه اطلاعات دقیق‌تر باشد، خروجی بهتری خواهید گرفت.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">2</div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-800 mb-2">ساخت نویسنده</h4>
                                <p className="text-slate-600 leading-relaxed">
                                    یک نویسنده هوشمند با سبک نگارش خاص بسازید. مثلاً می‌توانید یک نویسنده "جدی و فنی" برای مقالات تخصصی و یک نویسنده "صمیمی" برای اخبار شبکه‌های اجتماعی داشته باشید.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg">3</div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-800 mb-2">اجرای ایجنت</h4>
                                <p className="text-slate-600 leading-relaxed">
                                    حالا به داشبورد برگردید و روی گزینه <strong>اخبار روزانه</strong> کلیک کنید. دکمه شروع را بزنید تا سیستم به طور خودکار اخبار مرتبط را پیدا کرده و مقاله شما را بنویسد.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'support':
            return (
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:border-blue-200 transition-colors">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="font-bold text-xl text-slate-800 mb-2">ارسال ایمیل</h3>
                            <p className="text-slate-500 mb-4 text-sm">پاسخگویی معمولاً در کمتر از ۲ ساعت</p>
                            <a href="mailto:support@smartcontent.ai" className="text-blue-600 font-bold hover:underline">support@smartcontent.ai</a>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:border-green-200 transition-colors">
                            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            </div>
                            <h3 className="font-bold text-xl text-slate-800 mb-2">چت آنلاین</h3>
                            <p className="text-slate-500 mb-4 text-sm">گفتگو با کارشناسان فنی (۹ صبح تا ۵ عصر)</p>
                            <button className="text-green-600 font-bold hover:underline">شروع گفتگو</button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-2xl text-slate-800 mb-6">ارسال پیام</h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="text" placeholder="نام شما" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                                <input type="email" placeholder="ایمیل" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                            </div>
                            <input type="text" placeholder="موضوع" className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                            <textarea placeholder="پیام خود را بنویسید..." className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all h-40 resize-none"></textarea>
                            <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">ارسال پیام</button>
                        </form>
                    </div>
                </div>
            );

        case 'api':
            return (
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white">
                        <h3 className="text-xl font-bold mb-4">احراز هویت</h3>
                        <p className="text-slate-400 mb-4">برای استفاده از API نیاز به کلید دسترسی (API Key) دارید. این کلید را باید در هدر درخواست‌های خود ارسال کنید.</p>
                        <div className="bg-black/30 rounded-xl p-4 font-mono text-sm text-blue-300 border border-white/10" dir="ltr">
                            Authorization: Bearer YOUR_API_KEY
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold font-mono">POST</span>
                            <span className="font-mono text-slate-600">/v1/generate</span>
                        </div>
                        <p className="text-slate-600 mb-6">تولید محتوای متنی بر اساس موضوع و پارامترهای ورودی.</p>
                        
                        <h4 className="font-bold text-slate-800 mb-3 text-sm">نمونه درخواست (JSON)</h4>
                        <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm text-slate-700 border border-slate-200 overflow-x-auto" dir="ltr">
<pre>{`{
  "topic": "Artificial Intelligence in 2025",
  "tone": "Professional",
  "length": "Medium",
  "keywords": ["AI", "Future", "Tech"]
}`}</pre>
                        </div>
                    </div>
                </div>
            );

        case 'privacy':
            return (
                <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-slate-100 text-slate-600 leading-loose text-justify space-y-6">
                    <div className="mb-8 border-b border-slate-100 pb-6">
                        <h2 className="text-2xl font-extrabold text-slate-800">حریم خصوصی کاربران</h2>
                        <p className="text-slate-400 text-sm mt-2">آخرین بروزرسانی: ۱۴۰۳/۰۹/۲۰</p>
                    </div>

                    <p>ما در اسمارت کانتنت به حریم خصوصی شما احترام می‌گذاریم و متعهد به حفاظت از اطلاعات شخصی شما هستیم. این سیاست‌نامه توضیح می‌دهد که ما چگونه اطلاعات شما را جمع‌آوری، استفاده و محافظت می‌کنیم.</p>
                    
                    <h4 className="font-bold text-slate-800 text-xl pt-4">۱. اطلاعاتی که جمع‌آوری می‌کنیم</h4>
                    <p>ما اطلاعاتی نظیر نام، آدرس ایمیل، و اطلاعات مربوط به شرکت شما را صرفاً جهت ارائه خدمات بهتر و شخصی‌سازی تجربه کاربری ذخیره می‌کنیم.</p>

                    <h4 className="font-bold text-slate-800 text-xl pt-4">۲. امنیت داده‌ها</h4>
                    <p>تمامی اطلاعات شما به صورت رمزنگاری شده در سرورهای امن ما نگهداری می‌شوند. ما از پروتکل‌های امنیتی پیشرفته برای جلوگیری از دسترسی‌های غیرمجاز استفاده می‌کنیم.</p>

                    <h4 className="font-bold text-slate-800 text-xl pt-4">۳. عدم اشتراک‌گذاری با اشخاص ثالث</h4>
                    <p>ما متعهد می‌شویم که اطلاعات تجاری و محتوای تولید شده توسط شما را هرگز بدون اجازه کتبی با هیچ شخص ثالثی به اشتراک نگذاریم.</p>
                </div>
            );

        case 'terms':
            return (
                <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-slate-100 text-slate-600 leading-loose text-justify space-y-6">
                    <div className="mb-8 border-b border-slate-100 pb-6">
                        <h2 className="text-2xl font-extrabold text-slate-800">قوانین و شرایط استفاده</h2>
                        <p className="text-slate-400 text-sm mt-2">لطفاً پیش از استفاده از خدمات مطالعه فرمایید</p>
                    </div>

                    <p>با تشکر از انتخاب اسمارت کانتنت. استفاده از خدمات ما به منزله پذیرش کامل شرایط و قوانین زیر است:</p>
                    
                    <ul className="list-disc list-inside space-y-4 marker:text-blue-500">
                        <li>
                            <strong className="text-slate-800">تولید محتوا:</strong> مسئولیت نهایی محتوای تولید شده و نحوه استفاده از آن بر عهده کاربر است. ما ابزار را فراهم می‌کنیم، اما نظارت بر خروجی با شماست.
                        </li>
                        <li>
                            <strong className="text-slate-800">مالکیت معنوی:</strong> تمامی حقوق مالکیت معنوی محتوای تولید شده توسط هوش مصنوعی برای کاربر محفوظ است.
                        </li>
                        <li>
                            <strong className="text-slate-800">استفاده مجاز:</strong> کاربر متعهد می‌شود از این پلتفرم برای تولید محتوای غیرقانونی، توهین‌آمیز، نژادپرستانه یا مروج خشونت استفاده نکند.
                        </li>
                        <li>
                            <strong className="text-slate-800">تغییرات در سرویس:</strong> ما حق داریم در هر زمان برای بهبود سرویس، تغییراتی در امکانات یا تعرفه‌ها ایجاد کنیم که البته از قبل اطلاع‌رسانی خواهد شد.
                        </li>
                    </ul>
                </div>
            );

        default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans" dir="rtl">
        {/* Navbar */}
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">AI</div>
                    <span className="text-xl font-extrabold text-slate-800 tracking-tight">اسمارت کانتنت</span>
                </div>
                <button onClick={() => onNavigate('landing')} className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2">
                    <span>بازگشت به خانه</span>
                    <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
            </div>
        </nav>

        {/* Header */}
        <div className={`pt-32 pb-16 px-6 bg-gradient-to-br ${pageInfo.gradient} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="max-w-4xl mx-auto text-center relative z-10 animate-slide-up">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/20">
                    {pageInfo.icon}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">{pageInfo.title}</h1>
                <p className="text-lg text-white/80 font-medium">{pageInfo.subtitle}</p>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-16 animate-page-enter">
            {renderContent()}
        </div>

        {/* Simple Footer */}
        <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm border-t border-slate-800">
            <p className="mb-4">تمامی حقوق محفوظ است © ۱۴۰۳ اسمارت کانتنت</p>
            <div className="flex justify-center gap-6">
                <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">حریم خصوصی</button>
                <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">قوانین</button>
                <button onClick={() => onNavigate('support')} className="hover:text-white transition-colors">تماس با ما</button>
            </div>
        </footer>
    </div>
  );
}