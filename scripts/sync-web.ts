import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

const WEB_DIST = path.join(__dirname, '../web/dist');
const ASSETS_DIR = path.join(__dirname, '../assets/webviews');

async function syncWebAssets() {
  try {
    // 校验构建输出
    await fs.access(WEB_DIST);

    // 清空旧资源
    await fs.rm(ASSETS_DIR, { recursive: true, force: true });
    await fs.mkdir(ASSETS_DIR, { recursive: true });

    // 复制新资源
    await fs.cp(WEB_DIST, ASSETS_DIR, { recursive: true });

    // 添加版本标记
    const version = new Date().toISOString();
    await fs.writeFile(path.join(ASSETS_DIR, 'version.txt'), `build_version=${version}`);

    console.log(chalk.green('✅ Web assets synced successfully'));
  } catch (error) {
    console.error(chalk.red('❌ Web assets sync failed:'));
    console.error(error);
    process.exit(1);
  }
}

syncWebAssets();
