import { promptTools } from '../../../config/promptTools';
import PromptToolTemplate from '../common/PromptToolTemplate';

export default function PromptGenerator() {
  const config = promptTools.find(tool => tool.id === 'prompt-generator')!;
  return <PromptToolTemplate config={config} />;
}