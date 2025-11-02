
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateCertificate(name, score, topic) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();
  
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Title
  page.drawText('СЕРТИФИКАТ', {
    x: 0,
    y: height - 80,
    width: width,
    font: font,
    size: 30,
    color: rgb(0.1, 0.2, 0.5),
    align: 'center',
  });

  // Subtitle
  page.drawText('о прохождении тестирования по технике безопасности', {
    x: 0,
    y: height - 120,
    width: width,
    font: regularFont,
    size: 14,
    color: rgb(0.2, 0.2, 0.2),
    align: 'center',
  });

  // Main text
  page.drawText(`Настоящим подтверждается, что`, {
    x: 0,
    y: height - 180,
    width: width,
    font: regularFont,
    size: 16,
    align: 'center',
  });
  
  page.drawText(name, {
    x: 0,
    y: height - 210,
    width: width,
    font: font,
    size: 24,
    color: rgb(0.8, 0.6, 0.2),
    align: 'center',
  });

  page.drawText(`успешно прошел(а) тестирование по теме:`, {
    x: 0,
    y: height - 240,
    width: width,
    font: regularFont,
    size: 16,
    align: 'center',
  });

   page.drawText(topic, {
    x: 0,
    y: height - 265,
    width: width,
    font: font,
    size: 18,
    align: 'center',
  });


  page.drawText(`Результат: ${score}%`, {
    x: 0,
    y: height - 300,
    width: width,
    font: font,
    size: 20,
    color: rgb(0.2, 0.5, 0.2),
    align: 'center',
  });
  
  page.drawText(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, {
      x: 50,
      y: 50,
      font: regularFont,
      size: 12
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
