import {useState} from 'react'
import {createRoot} from 'react-dom/client'
import {MemoryRouter} from 'react-router-dom'
import AccountsPage from '../../src/features/accounts/AccountsPage'
import Topbar from '../../src/ui/Topbar'
import '../../src/style.css'
const account='0x7238000000000000000000000000000000003779'
function Fixture(){const mode=new URLSearchParams(location.search).get('state');const [connected,setConnected]=useState(mode==='connected');return <div className="full-layout"><Topbar settings={{chainId:97,rpc:'',api:'',fromBlock:'0'}} busy={false} account={connected?account:undefined} onConnect={()=>setConnected(true)} onDisconnect={()=>setConnected(false)} onChain={()=>{}} onCopy={()=>{}} onSelectSafe={()=>{}} notifications={[]}/><main className="accounts-main"><AccountsPage account={connected?account:undefined} safes={[]} busy={false} onConnect={()=>setConnected(true)} onAdd={()=>{}} onCreate={()=>{}} onImport={()=>{}} onOpen={()=>{}}/></main></div>}
createRoot(document.getElementById('root')!).render(<MemoryRouter><Fixture/></MemoryRouter>)
