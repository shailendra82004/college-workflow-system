const WORKFLOW_MAP = {
  // Simple
  LEAVE:            ['COORDINATOR'],
  LAB_ACCESS:       ['COORDINATOR'],
  ASSIGNMENT_EXT:   ['COORDINATOR'],
  LIBRARY_EXT:      ['COORDINATOR'],
  // Medium
  FEE_CONCESSION:   ['COORDINATOR', 'HOD'],
  CERTIFICATE:      ['COORDINATOR', 'HOD'],
  SCHOLARSHIP:      ['COORDINATOR', 'HOD'],
  COURSE_CHANGE:    ['COORDINATOR', 'HOD'],
  EXAM_REEVAL:      ['COORDINATOR', 'HOD'],
  // Complex
  PROJECT:          ['COORDINATOR', 'HOD', 'DIRECTOR'],
  EQUIPMENT:        ['COORDINATOR', 'HOD', 'DIRECTOR'],
  RESEARCH:         ['COORDINATOR', 'HOD', 'DIRECTOR'],
  INDUSTRIAL_VISIT: ['COORDINATOR', 'HOD', 'DIRECTOR'],
  OTHER:            ['COORDINATOR', 'HOD', 'DIRECTOR'],
}


const COORDINATOR_WORKFLOW_MAP = {
  LEAVE:            ['HOD'],
  LAB_ACCESS:       ['HOD'],
  EQUIPMENT:        ['HOD', 'DIRECTOR'],
  COURSE_CHANGE:    ['HOD', 'DIRECTOR'],
  CERTIFICATE:      ['HOD', 'DIRECTOR'],
  RESEARCH:         ['HOD', 'DIRECTOR'],
  INDUSTRIAL_VISIT: ['HOD', 'DIRECTOR'],
  PROJECT:          ['HOD', 'DIRECTOR'],
  OTHER:            ['HOD', 'DIRECTOR'],
}


const HOD_WORKFLOW_MAP = {
  LEAVE:            ['DIRECTOR'],
  LAB_ACCESS:       ['DIRECTOR'],
  EQUIPMENT:        ['DIRECTOR'],
  COURSE_CHANGE:    ['DIRECTOR'],
  CERTIFICATE:      ['DIRECTOR'],
  RESEARCH:         ['DIRECTOR'],
  INDUSTRIAL_VISIT: ['DIRECTOR'],
  PROJECT:          ['DIRECTOR'],
  OTHER:            ['DIRECTOR'],
}


function getWorkflowMap(submitterRole) {
  if (submitterRole === 'COORDINATOR') return COORDINATOR_WORKFLOW_MAP
  if (submitterRole === 'HOD')         return HOD_WORKFLOW_MAP
  return WORKFLOW_MAP 
}

module.exports = { WORKFLOW_MAP, COORDINATOR_WORKFLOW_MAP, HOD_WORKFLOW_MAP, getWorkflowMap }
