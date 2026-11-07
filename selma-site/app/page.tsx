import Petition from './petition';
import { getChatGPTUser } from './chatgpt-auth';
export const dynamic = 'force-dynamic';
export default async function Home() { const u = await getChatGPTUser(); return <Petition signedIn={!!u}/>; }
