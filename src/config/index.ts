import { isAndroidPlatform, isWebPlatform, getActivePlatform, getApiBaseUrl } from './platform';
import { androidConfig } from './android.config';
import { webConfig } from './web.config';

/**
 * Unified Configuration Registry (سجل الإعدادات الموحد مع الفصل التام)
 * 
 * - للوصول لإعدادات الأندرويد فقط: استورد `androidConfig`
 * - للوصول لإعدادات الويب فقط: استورد `webConfig`
 * - للوصول للإعداد النشط تلقائياً: استورد `activeConfig`
 */

export { androidConfig, webConfig, isAndroidPlatform, isWebPlatform, getActivePlatform, getApiBaseUrl };

export const activeConfig = isAndroidPlatform() ? androidConfig : webConfig;

export default {
  android: androidConfig,
  web: webConfig,
  active: activeConfig,
  platform: getActivePlatform(),
};
