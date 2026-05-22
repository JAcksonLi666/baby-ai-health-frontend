import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, 'public');

// 确保 public 目录存在
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// 创建 192x192 图标
const icon192 = sharp({
  create: {
    width: 192,
    height: 192,
    channels: 4,
    background: { r: 24, g: 144, b: 255, alpha: 1 }
  }
})
  .png()
  .toBuffer();

// 创建 512x512 图标
const icon512 = sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 24, g: 144, b: 255, alpha: 1 }
  }
})
  .png()
  .toBuffer();

async function generateIcons() {
  try {
    // 生成 192x192 图标
    const buffer192 = await icon192;
    await sharp(buffer192)
      .png({ quality: 100 })
      .toFile(join(publicDir, 'icon-192.png'));

    // 生成 512x512 图标
    const buffer512 = await icon512;
    await sharp(buffer512)
      .png({ quality: 100 })
      .toFile(join(publicDir, 'icon-512.png'));

    console.log('✅ PWA 图标生成成功！');
    console.log('📁 文件位置:');
    console.log('   - public/icon-192.png');
    console.log('   - public/icon-512.png');
    console.log('\n提示: 你可以用自己的图标替换这些文件');
  } catch (error) {
    console.error('❌ 图标生成失败:', error);
  }
}

generateIcons();
