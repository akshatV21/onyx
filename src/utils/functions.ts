import { FeatureStatus, ProjectStatus } from 'generated/prisma/enums'

export function projectIsLocked(status: ProjectStatus) {
  return status === ProjectStatus.paused || status === ProjectStatus.completed || status === ProjectStatus.archived
}

export function featureIsLocked(status: FeatureStatus) {
  return status === FeatureStatus.in_review || status === FeatureStatus.completed || status === FeatureStatus.deployed
}
