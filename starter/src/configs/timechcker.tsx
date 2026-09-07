function validateTimeRange(startTime: string, endTime: string): { isValid: boolean; message: string } {
  // الگوی بررسی فرمت ساعت (HH:mm)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

  if (!timeRegex.test(startTime)) {
    return { isValid: false, message: 'ساعت شروع نامعتبر است (فرمت صحیح: HH:mm)' };
  }

  if (!timeRegex.test(endTime)) {
    return { isValid: false, message: 'ساعت پایان نامعتبر است (فرمت صحیح: HH:mm)' };
  }

  // تبدیل ساعت‌ها به دقیقه برای مقایسه دقیق
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  if (startTotalMinutes >= endTotalMinutes) {
    return { isValid: false, message: 'ساعت شروع باید قبل از ساعت پایان باشد' };
  }

  return { isValid: true, message: 'زمان معتبر است' };
}