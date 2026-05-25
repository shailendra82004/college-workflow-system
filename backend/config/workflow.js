// Workflow chains for students — defines which roles need to approve each request type
const WORKFLOW_MAP = {
  // Quick approvals — coordinator only
  LEAVE:            ['COORDINATOR'],
  LAB_ACCESS:       ['COORDINATOR'],
  ASSIGNMENT_EXT:   ['COORDINATOR'],
  LIBRARY_EXT:      ['COORDINATOR'],
  // Needs both coordinator and HOD sign-off
  FEE_CONCESSION:   ['COORDINATOR', 'HOD'],
  CERTIFICATE:      ['COORDINATOR', 'HOD'],
  SCHOLARSHIP:      ['COORDINATOR', 'HOD'],
  COURSE_CHANGE:    ['COORDINATOR', 'HOD'],
  EXAM_REEVAL:      ['COORDINATOR', 'HOD'],
  // Goes all the way up to the director
  PROJECT:          ['COORDINATOR', 'HOD', 'DIRECTOR'],
  EQUIPMENT:        ['COORDINATOR', 'HOD', 'DIRECTOR'],
  RESEARCH:         ['COORDINATOR', 'HOD', 'DIRECTOR'],
  INDUSTRIAL_VISIT: ['COORDINATOR', 'HOD', 'DIRECTOR'],
  OTHER:            ['COORDINATOR', 'HOD', 'DIRECTOR'],
}

// When a coordinator submits a request, it skips their own level and starts at HOD
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

// When a HOD submits a request, it goes straight to the director
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

// Returns the right workflow map depending on who submitted the request
function getWorkflowMap(submitterRole) {
  if (submitterRole === 'COORDINATOR') return COORDINATOR_WORKFLOW_MAP
  if (submitterRole === 'HOD')         return HOD_WORKFLOW_MAP
  return WORKFLOW_MAP
}

module.exports = { WORKFLOW_MAP, COORDINATOR_WORKFLOW_MAP, HOD_WORKFLOW_MAP, getWorkflowMap }
