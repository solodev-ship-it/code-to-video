import type {Json} from '../../packages/projects/src/manifest.ts';
export type TemplateDefinition = Readonly<{id:string; compositionId:string; durationInFrames:number; props:Readonly<Record<string,Json>>}>;
const templates: readonly TemplateDefinition[] = [
  {id:'title-card',compositionId:'TitleCard',durationInFrames:180,props:{
    label:'SAMPLE COPY · TITLE CARD', title:'Give your next idea a clear beginning.',
    subtitle:'Replace this sample with your opening message.',footer:'Your story starts here',reducedMotion:false,
  }},
  {id:'explainer',compositionId:'ThreePointExplainer',durationInFrames:240,props:{
    label:'SAMPLE COPY · EXPLAINER', title:'One idea. Three clear steps.',
    points:[
      {title:'Set the context',body:'Explain the situation in a sentence.'},
      {title:'Show the approach',body:'Describe the action your audience can take.'},
      {title:'Make it useful',body:'Finish with a specific next step.'},
    ],footer:'Replace every sample before production',reducedMotion:false,
  }},
];
export function getTemplate(id: string): TemplateDefinition {
  const template = templates.find(t => t.id === id);
  if (!template) throw new Error(`Unknown template ${JSON.stringify(id)}; expected title-card or explainer`);
  return template;
}
