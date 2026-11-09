/**
 * Everything this extension keeps between reloads.
 *
 * `host.storage` is scoped to this extension on the connected OpenChamber
 * server, so a project link and a preference are per-server, not per-device.
 * There is no per-project scope in the host API, so the project a directory
 * maps to is keyed by a short hash of the directory and the value records the
 * directory it was written for: a hash collision is detected and ignored
 * rather than showing another repository's pipelines.
 *
 * Every reader passes through a sanitizer. Storage is this extension's only
 * writer, but a corrupted or hand-edited value must degrade to "unset" instead
 * of reaching a render.
 */
import type { PipelineDefinition, Preferences, StoredProject } from "./types";

export type JsonValue =
  null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

/** The part of `host.storage` this module uses, so it can be tested with a fake. */
export interface StorageLike {
  get(key: string): Promise<unknown>;
  set(key: string, value: JsonValue): Promise<void>;
  delete(key: string): Promise<void>;
}

export const PREFERENCES_KEY = "prefs";

/** `host.storage` caps a key at 128 characters; a path is longer, so hash it. */
export function hashString(text: string): string {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) + hash + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

export function directoryKey(directory: string): string {
  return `project:${hashString(directory)}`;
}

export function pipelinesKey(projectId: string): string {
  return `pipelines:${projectId}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export interface StoredProjectRecord extends StoredProject {
  /** The directory this link was written for; a mismatch means a hash collision. */
  directory: string;
}

export function readProjectRecord(value: unknown): StoredProjectRecord | null {
  if (!isObject(value)) return null;
  const projectId = text(value.projectId);
  const projectName = text(value.projectName);
  const orgName = text(value.orgName);
  const directory = text(value.directory);
  if (!projectId || !projectName || !orgName || !directory) return null;
  const source = value.source === "detected" ? "detected" : "picked";
  return {
    projectId,
    projectName,
    orgName,
    slug: text(value.slug),
    source,
    directory,
  };
}

export async function loadProject(
  storage: StorageLike,
  directory: string,
): Promise<StoredProjectRecord | null> {
  const record = readProjectRecord(await storage.get(directoryKey(directory)));
  if (!record || record.directory !== directory) return null;
  return record;
}

export async function saveProject(
  storage: StorageLike,
  directory: string,
  project: StoredProject,
): Promise<void> {
  await storage.set(directoryKey(directory), {
    projectId: project.projectId,
    projectName: project.projectName,
    orgName: project.orgName,
    slug: project.slug,
    source: project.source,
    directory,
  });
}

export async function clearProject(storage: StorageLike, directory: string): Promise<void> {
  await storage.delete(directoryKey(directory));
}

export const DEFAULT_PREFERENCES: Preferences = { autoRefresh: true };

export function readPreferences(value: unknown): Preferences {
  if (!isObject(value)) return { ...DEFAULT_PREFERENCES };
  return { autoRefresh: value.autoRefresh === false ? false : true };
}

export async function loadPreferences(storage: StorageLike): Promise<Preferences> {
  return readPreferences(await storage.get(PREFERENCES_KEY));
}

export async function savePreferences(
  storage: StorageLike,
  patch: Partial<Preferences>,
): Promise<Preferences> {
  const current = await loadPreferences(storage);
  const next: Preferences = { ...current, ...patch };
  await storage.set(PREFERENCES_KEY, { autoRefresh: next.autoRefresh });
  return next;
}

export function readPipelineCache(value: unknown): PipelineDefinition[] | null {
  if (!Array.isArray(value)) return null;
  const definitions: PipelineDefinition[] = [];
  for (const entry of value) {
    if (!isObject(entry)) continue;
    const id = text(entry.id);
    const name = text(entry.name);
    if (!id || !name) continue;
    definitions.push({ id, name, configPath: text(entry.configPath) ?? "" });
  }
  return definitions.length > 0 ? definitions : null;
}

export async function loadPipelineCache(
  storage: StorageLike,
  projectId: string,
): Promise<PipelineDefinition[] | null> {
  return readPipelineCache(await storage.get(pipelinesKey(projectId)));
}

export async function savePipelineCache(
  storage: StorageLike,
  projectId: string,
  definitions: PipelineDefinition[],
): Promise<void> {
  await storage.set(
    pipelinesKey(projectId),
    definitions.map((definition) => ({
      id: definition.id,
      name: definition.name,
      configPath: definition.configPath,
    })),
  );
}
