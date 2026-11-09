/**
 * The project picker.
 *
 * Its own state (open, loading, error, the project list and the filter), so a
 * change to how a project is chosen cannot disturb the run drill-down. The
 * panel supplies the client, the file reader and what to do once a project is
 * picked; the picker owns the rest.
 */
import type { CircleCIClient } from "../shared/client";
import { el } from "../shared/dom";
import { describeError, isDisconnected } from "../shared/errors";
import type { StorageLike } from "../shared/storage";
import type { Project } from "../shared/types";
import {
  mountBanner,
  mountButton,
  mountEmpty,
  mountList,
  mountSearchField,
  spinnerHolder,
} from "../shared/ui";
import { detectRepo, linkProject, type ReadProjectFile, type Workspace } from "../shared/workspace";

type Notify = (kind: "info" | "success" | "error", message: string) => Promise<void>;

export interface PickerDeps {
  client: CircleCIClient;
  storage: StorageLike;
  readProjectFile: ReadProjectFile;
  directory: () => string | null;
  notify: Notify;
  /** Repaint the surface that hosts the picker. */
  repaint: () => void;
  /** True when the picker was opened over an existing workspace. */
  canCancel: () => boolean;
  onCancel: () => Promise<void> | void;
  onPicked: (workspace: Workspace) => Promise<void> | void;
  /** The token stopped working; the panel shows its connect screen. */
  onDisconnected: () => void;
}

export interface ProjectPicker {
  isOpen: () => boolean;
  open: () => Promise<void>;
  reset: () => void;
  render: (root: HTMLElement) => void;
}

export function createProjectPicker(deps: PickerDeps): ProjectPicker {
  let open = false;
  let loading = false;
  let error: string | null = null;
  let projects: Project[] = [];
  let filter = "";

  function reset(): void {
    open = false;
    loading = false;
    error = null;
    projects = [];
    filter = "";
  }

  async function load(): Promise<void> {
    loading = true;
    error = null;
    deps.repaint();
    try {
      const orgs = await deps.client.listOrgs();
      const results = await Promise.allSettled(
        orgs.map((org) => deps.client.listProjectsOfOrg(org.id)),
      );
      const list: Project[] = [];
      for (const result of results) {
        if (result.status === "fulfilled") list.push(...result.value.items);
      }
      list.sort((left, right) => {
        const byOrg = left.orgName.localeCompare(right.orgName);
        return byOrg !== 0 ? byOrg : left.name.localeCompare(right.name);
      });
      projects = list;
    } catch (failure) {
      error = describeError(failure);
      if (isDisconnected(failure)) deps.onDisconnected();
    }
    loading = false;
    deps.repaint();
  }

  async function pick(project: Project): Promise<void> {
    const directory = deps.directory();
    if (!directory) return;
    try {
      const repo = await detectRepo(deps.readProjectFile);
      const workspace = await linkProject(deps.storage, directory, project, repo);
      reset();
      await deps.onPicked(workspace);
    } catch (failure) {
      await deps.notify("error", describeError(failure));
    }
  }

  function items(): Array<{ id: string; leading: string; title: string }> {
    const needle = filter.trim().toLowerCase();
    return projects
      .filter((project) => {
        if (!needle) return true;
        return `${project.orgName}/${project.name}`.toLowerCase().includes(needle);
      })
      .map((project) => ({
        id: project.id,
        leading: project.orgName ? `${project.orgName}/` : "",
        title: project.name,
      }));
  }

  function render(root: HTMLElement): void {
    const head = el("div", { className: "detail-head" });
    head.append(el("div", { className: "detail-title" }, "Choose a CircleCI project"));
    head.append(
      el(
        "div",
        { className: "detail-sub" },
        "This extension remembers the choice per OpenChamber project.",
      ),
    );
    if (deps.canCancel()) {
      const back = el("div");
      mountButton(back, {
        label: "Back",
        variant: "ghost",
        size: "sm",
        onClick: () => {
          reset();
          void deps.onCancel();
        },
      });
      head.append(back);
    }
    root.append(head);

    if (error) {
      const holder = el("div");
      root.append(holder);
      mountBanner(holder, {
        tone: "error",
        title: "CircleCI",
        body: error,
        action: { label: "Retry", onClick: () => void load() },
      });
    }

    if (loading) {
      root.append(spinnerHolder("Loading projects"));
      return;
    }

    if (projects.length === 0) {
      if (error) return;
      const holder = el("div");
      root.append(holder);
      mountEmpty(holder, {
        title: "No projects",
        body: "This token is not a member of any CircleCI organization with projects, or the token cannot list them.",
      });
      return;
    }

    const searchHolder = el("div");
    root.append(searchHolder);
    const listHolder = el("div", { className: "scroll" });
    root.append(listHolder);

    const list = mountList(listHolder, {
      items: items(),
      ariaLabel: "CircleCI projects",
      onSelect: (id) => {
        const project = projects.find((entry) => entry.id === id);
        if (project) void pick(project);
      },
    });
    // The kit never commits a typed or cleared value: it reports the change and
    // waits for `update({ value })`, so Escape and the clear button need it too.
    let search: ReturnType<typeof mountSearchField> | null = null;
    search = mountSearchField(searchHolder, {
      value: filter,
      label: "Filter projects",
      placeholder: "Filter by organization or repository",
      onChange: (value) => {
        filter = value;
        search?.update({ value });
        list.update({ items: items() });
      },
    });
  }

  return {
    isOpen: () => open,
    reset,
    render,
    open: async () => {
      open = true;
      await load();
    },
  };
}
