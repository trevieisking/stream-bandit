/* Code Labs Page Runtime V249 - explicit shared tab groups. */
(function(){
'use strict';
var VERSION='V249-page-runtime-explicit-groups',busy=false,sequence=0,discovery=null,TABS_ID='clProductTabsV227',BRIDGE_ID='clBuddyPageBridgeV139',FOOTER_ID='clFooterBuddyShellV201',GROUPS=['work','guidance','saved'];
var ID_GROUPS={
  clWorkflowClarityV130:'guidance',
  clWorkflowGuardV138:'guidance',
  clPageCompletionV139:'guidance',
  clSaveMeaningV132:'guidance',
  clToolsUtilityLane:'guidance',
  clToolSearch:'guidance',
  clLocalUtilityTool:'guidance',
  clLocalDiffTool:'guidance',
  clHtmlSafetyTool:'guidance',
  clCurrentFileOverwriteV201:'saved',
  clHistoryPanel:'saved',
  clBuddyMemoryTool:'saved',
  clSafeChangePacketTool:'saved',
  clRawGitHubTool:'saved',
  clBackendVsHosting:'work'
};
var PAGE_RULES={
  setup