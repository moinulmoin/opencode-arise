/**
 * 配置路徑工具函數
 * Configuration path utility functions
 *
 * 集中管理所有與配置文件路徑相關的邏輯
 * Centralized management of all config file path related logic
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { homedir } from "os";
import { resolve } from "path";

import { SHADOW_AGENTS } from "../agents/shadows";
import { DEFAULT_CONFIG, type AriseConfig } from "./schema";

/**
 * 取得使用者主目錄
 * Get user home directory
 *
 * 使用 os.homedir() 確保跨平台相容性
 * Use os.homedir() for cross-platform compatibility
 *
 * @returns {string} 使用者主目錄路徑
 */
function getHomeDir(): string {
	return homedir();
}

/**
 * OpenCode 插件名稱
 * OpenCode plugin name
 */
export const PLUGIN_NAME = "opencode-arise";

/**
 * Arise 配置檔案名稱
 * Arise config file name
 */
export const CONFIG_FILENAME = "opencode-arise.json";

/**
 * OpenCode 配置檔案路徑列表
 * OpenCode config file path list
 *
 * @type {string[]}
 */
export const OPENCODE_CONFIG_PATHS = [
	resolve(getHomeDir(), ".config/opencode/opencode.json"),
	resolve(getHomeDir(), ".config/opencode/opencode.jsonc"),
];

/**
 * 取得 OpenCode 配置目錄路徑
 * Get OpenCode config directory path
 *
 * @returns {string} OpenCode 配置目錄路徑
 */
export function getOpencodeConfigDir(): string {
	return resolve(getHomeDir(), ".config/opencode");
}

/**
 * 取得 Arise 配置檔案路徑
 * Get Arise config file path
 *
 * @returns {string} Arise 配置檔案完整路徑
 */
export function getAriseConfigPath(): string {
	return resolve(getOpencodeConfigDir(), CONFIG_FILENAME);
}

/**
 * 取得 Arise 配置檔案搜尋路徑列表
 * Get Arise config file search path list
 *
 * 依序為：
 * 1. 工作目錄下的 .opencode/ 目錄
 * 2. 使用者配置目錄 (~/.config/opencode/)
 *
 * @param worktree - 工作目錄路徑，若為空則只返回全局配置路徑
 * @returns {string[]} 配置檔案搜尋路徑列表（順序：由局部到全局）
 */
export function getAriseConfigPaths(worktree?: string): string[] {
	const globalPath = resolve(getOpencodeConfigDir(), CONFIG_FILENAME);

	if (!worktree) {
		return [globalPath];
	}

	const localPath = resolve(worktree, ".opencode", CONFIG_FILENAME);

	// 返回順序：先局部（local），後全局（global）
	// 載入時需要反序（先全局，後局部）
	return [localPath, globalPath];
}

/**
 * 查詢 OpenCode 配置檔案路徑
 * Find OpenCode config file path
 *
 * @returns {string | null} 配置檔案路徑，若不存在則返回 null
 */
export function findOpencodeConfig(): string | null {
	for (const path of OPENCODE_CONFIG_PATHS) {
		if (existsSync(path)) {
			return path;
		}
	}
	return null;
}

/**
 * 檢查 OpenCode 配置檔案是否存在
 * Check if OpenCode config file exists
 *
 * @returns {boolean} 配置檔案是否存在
 */
export function hasOpencodeConfig(): boolean {
	return findOpencodeConfig() !== null;
}

/**
 * 檢查 Arise 配置檔案是否存在
 * Check if Arise config file exists
 *
 * @param worktree - 可選的工作目錄路徑
 * @returns {boolean} 配置檔案是否存在
 */
export function hasAriseConfig(worktree?: string): boolean {
	const paths = getAriseConfigPaths(worktree);
	return paths.some((path) => existsSync(path));
}

/**
 * 取得預設 Arise 配置物件
 * Get default Arise config object
 *
 * @returns {AriseConfig} 預設配置物件
 */
export function getDefaultAriseConfig(): AriseConfig {
	// 從 SHADOW_AGENTS 產生預設的 agents 設定
	// Generate default agents config from SHADOW_AGENTS
	const defaultAgents = Object.fromEntries(
		Object.entries(SHADOW_AGENTS).map(([name, agent]) => [
			name,
			{ model: agent.model },
		])
	) as AriseConfig["agents"];

	return {
		show_banner: true,
		disabled_shadows: [],
		disabled_hooks: [],
		agents: defaultAgents,
	};
}

/**
 * 建立預設 Arise 配置檔案
 * Create default Arise config file
 *
 * 當配置檔案不存在時，会建立預設配置
 * Creates default config when config file does not exist
 *
 * @param configPath - 自定義配置檔案路徑（可選，預設為全局配置路徑）
 * @returns {boolean} 是否成功建立配置檔案
 */
export function createDefaultAriseConfig(configPath?: string): boolean {
	const targetPath = configPath || getAriseConfigPath();

	if (existsSync(targetPath)) {
		return false;
	}

	const configDir = resolve(targetPath, "..");
	const defaultConfig = getDefaultAriseConfig();

	try {
		if (!existsSync(configDir)) {
			mkdirSync(configDir, { recursive: true });
		}
		writeFileSync(targetPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
		return true;
	} catch (err) {
		console.error("✗ Failed to create config:", err);
		return false;
	}
}
