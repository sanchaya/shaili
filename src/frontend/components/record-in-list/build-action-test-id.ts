import { ActionJSON } from "adminjs";

export const buildActionTestId = (action: ActionJSON): string => `action-${action.name}`
