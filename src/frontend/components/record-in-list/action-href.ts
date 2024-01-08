import { ActionJSON, ActionParams, BulkActionParams, RecordActionParams, ViewHelpers } from "adminjs"

interface DifferentActionParams {
  resourceId: ActionParams['resourceId'];
  recordId?: string | undefined;
  recordIds?: BulkActionParams['recordIds'];
  search?: string;
}
const h = new ViewHelpers()

export const actionHref = (
  action: ActionJSON,
  params: DifferentActionParams,
): string | null => {
  const actionName = action.name

  if (!action.component && !action.hasHandler) {
    return null
  }

  const hrefMap = {
    record: (): string => h.recordActionUrl({
      ...params as RecordActionParams,
      actionName,
    }),
    resource: (): string => h.resourceActionUrl({
      resourceId: params.resourceId,
      actionName,
      search: params.search,
    }),
    bulk: (): string => h.bulkActionUrl({
      ...params,
      actionName,
    }),
  }
  if (hrefMap[action.actionType]) {
    return hrefMap[action.actionType]()
  }
  throw new Error('"actionType" should be either record, resource or bulk')
}
