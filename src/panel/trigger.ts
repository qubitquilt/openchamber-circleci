/**
 * The "Run a pipeline" form.
 *
 * It holds its own form state (branch, chosen pipeline, its own error and
 * loading flags), so a change to the form cannot disturb the run drill-down
 * that shares the panel. The panel supplies the project, the file reader and a
 * repaint callback; the form owns everything between opening and submitting.
 */
import type { CircleCIClient } from "../shared/client";
import { el } from "../shared/dom";
import { describeError } from "../shared/errors";
import { loadPipelineCache, savePipelineCache, type StorageLike } from "../shared/storage";
import type { PipelineDefinition } from "../shared/types";
import { mountButton, mountSelect, mountTextField, spinnerHolder } from "../shared/ui";
import { detectBranch, type ReadProjectFile, type Workspace } from "../shared/workspace";

type Notify = (kind: "info" | "success" | "error", message: string) => Promise<void>;

export interface TriggerDeps {
  client: CircleCIClient;
  storage: StorageLike;
  readProjectFile: ReadProjectFile;
  /** The open project directory, for the branch prefill. */
  directory: () => string | null;
  /** The workspace the form would fire a run in. */
  workspace: () => Workspace | null;
  notify: Notify;
  /** Repaint the surface that hosts the form. */
  repaint: () => void;
  /** A run was accepted; the panel reloads its list. */
  onStarted: () => Promise<void> | void;
}

export interface TriggerForm {
  isOpen: () => boolean;
  open: () => Promise<void>;
  reset: () => void;
  render: (root: HTMLElement) => void;
}

export function createTriggerForm(deps: TriggerDeps): TriggerForm {
  let open = false;
  let loading = false;
  let pipelines: PipelineDefinition[] = [];
  let pipelineId = "";
  let branch = "";
  let error: string | null = null;
  let running = false;

  function reset(): void {
    open = false;
    loading = false;
    pipelines = [];
    pipelineId = "";
    branch = "";
    error = null;
    running = false;
  }

  async function loadPipelines(workspace: Workspace): Promise<void> {
    // Never carry another project's list: reset to this project's cache first,
    // so a failed refresh cannot leave the form seeding a stale id.
    pipelines = (await loadPipelineCache(deps.storage, workspace.link.projectId)) ?? [];
    try {
      const definitions = await deps.client.listPipelines(workspace.link.projectId);
      pipelines = definitions;
      await savePipelineCache(deps.storage, workspace.link.projectId, definitions);
    } catch {
      // Keep this project's cache, or an empty list. Never another project's.
    }
  }

  async function submit(): Promise<void> {
    const workspace = deps.workspace();
    if (!workspace || !open) return;
    const chosen = pipelines.some((pipeline) => pipeline.id === pipelineId)
      ? pipelineId
      : (pipelines[0]?.id ?? "");
    if (!chosen) {
      error = "This project has no pipeline to run.";
      deps.repaint();
      return;
    }
    const target = branch.trim();
    if (!target) {
      error = "Name a branch or tag to build.";
      deps.repaint();
      return;
    }
    running = true;
    error = null;
    deps.repaint();
    try {
      await deps.client.fireRun({
        projectId: workspace.link.projectId,
        pipelineId: chosen,
        branch: target,
      });
      reset();
      await deps.notify("success", `Started a run on ${target}.`);
      await deps.onStarted();
    } catch (failure) {
      running = false;
      error = describeError(failure);
      deps.repaint();
    }
  }

  function render(root: HTMLElement): void {
    const head = el("div", { className: "detail-head" });
    const top = el("div", { className: "row" });
    const back = el("div");
    mountButton(back, {
      label: "← Runs",
      variant: "ghost",
      size: "sm",
      onClick: () => {
        reset();
        deps.repaint();
      },
    });
    top.append(back);
    top.append(el("span", { className: "spacer" }));
    head.append(top);
    head.append(el("div", { className: "detail-title" }, "Run a pipeline"));
    head.append(
      el(
        "div",
        { className: "detail-sub" },
        "Fire a new run on a branch or tag. The pipeline definition picks which config to build.",
      ),
    );
    root.append(head);

    if (loading) {
      root.append(spinnerHolder("Loading pipelines"));
      return;
    }

    const body = el("div", { className: "section" });
    if (pipelines.length > 1) {
      const holder = el("div");
      let select: ReturnType<typeof mountSelect> | null = null;
      select = mountSelect(holder, {
        label: "Pipeline",
        value: pipelineId,
        options: pipelines.map((pipeline) => ({
          id: pipeline.id,
          label: pipeline.name,
          hint: pipeline.configPath,
        })),
        onChange: (id) => {
          pipelineId = id;
          select?.update({ value: id });
        },
      });
      body.append(holder);
    } else if (pipelines.length === 1) {
      body.append(el("p", { className: "notice" }, `Pipeline: ${pipelines[0]?.name ?? ""}`));
    } else {
      body.append(
        el(
          "p",
          { className: "notice error-text" },
          "This project lists no pipeline definition to run.",
        ),
      );
    }

    const branchHolder = el("div");
    let field: ReturnType<typeof mountTextField> | null = null;
    field = mountTextField(branchHolder, {
      label: "Branch or tag",
      value: branch,
      placeholder: "main",
      mono: true,
      onChange: (value) => {
        branch = value;
        error = null;
        field?.update({ value });
      },
    });
    body.append(branchHolder);

    if (error) body.append(el("p", { className: "notice error-text" }, error));

    const actions = el("div", { className: "detail-actions" });
    const runHolder = el("div");
    mountButton(runHolder, {
      label: "Start run",
      loading: running,
      disabled: running || pipelines.length === 0,
      onClick: () => void submit(),
    });
    actions.append(runHolder);
    body.append(actions);
    root.append(body);
  }

  return {
    isOpen: () => open,
    reset,
    render,
    open: async () => {
      const workspace = deps.workspace();
      if (!workspace) return;
      const detected = deps.directory() ? await detectBranch(deps.readProjectFile) : null;
      open = true;
      loading = true;
      pipelines = [];
      pipelineId = "";
      branch = detected ?? "";
      error = null;
      running = false;
      deps.repaint();
      await loadPipelines(workspace);
      if (!open) return;
      loading = false;
      pipelineId = pipelines[0]?.id ?? "";
      deps.repaint();
    },
  };
}
