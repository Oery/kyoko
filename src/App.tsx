import '@/App.css';
import { Label } from './components/ui/label';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Maximize, Minimize, Minus, Plus, RectangleHorizontal, Search, X } from 'lucide-react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from './components/ui/table';
import { ModeToggle } from './components/mode-toggle';
import { useEffect, useMemo, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './components/ui/resizable';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

interface Packet {
	id: number;
	source: 'Client' | 'Server';
	type: string;
	state: 'Handshake' | 'Status' | 'Login' | 'Play';
	data?: unknown;
}

const packetTypes = [
	'KeepAlive',
	'Chat',
	'Position',
	'Look',
	'PositionLook',
	'ServerInfo',
	'Ping',
	'PingStart',
];

function generateMockPackets(count: number): Packet[] {
	const packets: Packet[] = [];
	for (let i = 0; i < count; i++) {
		const randomSource = Math.random() < 0.5 ? 'Client' : 'Server';
		const randomType = packetTypes[Math.floor(Math.random() * packetTypes.length)];
		const randomState = Math.random() < 0.5 ? 'Handshake' : 'Status';

		packets.push({
			id: i + 1,
			source: randomSource,
			state: randomState,
			type: randomType,
			data: {
				method: 'GET',
				url: '/',
				httpVersion: '1.1',
			},
		});
	}
	return packets;
}

function App() {
	const [packets, setPackets] = useState<Packet[]>([]);
	const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
	const [searchTerm, setSearchTerm] = useState<string>('');

	useEffect(() => {
		const unlisten = listen<Packet>('new-packet', (event) => {
			setPackets((packets) => [...packets, event.payload]);
		});

		return () => {
			unlisten.then((f) => f());
		};
	}, []);

	const handleNewPacketClick = () => {
		invoke<Packet>('new_packet').then((packet) => {
			setPackets((packets) => [...packets, packet]);
		});
	};

	const filteredPackets = useMemo(() => {
		return packets.filter((packet) => JSON.stringify(packet).includes(searchTerm));
	}, [packets, searchTerm]);

	return (
		<div className='flex flex-col h-screen bg-background select-none'>
			<div className='p-4 border-b flex justify-between items-center'>
				<div className='flex items-center space-x-4'>
					<h1 className='text-xl font-bold'>Kyoko</h1>
				</div>
				<div className='flex items-center space-x-2'>
					<Button variant={'outline'} size={'icon'} onClick={handleNewPacketClick}>
						<Plus className='h-4 w-4' />
					</Button>
					<ModeToggle />
					<Button variant={'outline'} size={'icon'}>
						<Minus className='h-4 w-4' />
					</Button>
					<Button variant={'outline'} size={'icon'}>
						<RectangleHorizontal className='h-4 w-4' />
					</Button>
					<Button variant={'outline'} size={'icon'}>
						<X className='h-4 w-4' />
					</Button>
				</div>
			</div>
			<div className='flex flex-1 overflow-hidden'>
				<ResizablePanelGroup direction='horizontal'>
					<ResizablePanel className='p-4'>
						<div className='mb-4 flex items-center space-x-2'>
							<Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
							<Button variant={'outline'} size={'icon'}>
								<Search className='h-4 w-4' />
							</Button>
						</div>
						<div className='h-full overflow-y-auto relative pr-4 mr-[-12px]'>
							<Table>
								<TableHeader className='bg-background'>
									<TableRow>
										<TableHead>ID</TableHead>
										<TableHead>Source</TableHead>
										<TableHead>State</TableHead>
										<TableHead>Type</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredPackets.slice(0, 500).map((packet) => (
										<TableRow
											key={packet.id}
											onClick={() => setSelectedPacket(packet)}
											className={`cursor-pointer ${
												packet.id === selectedPacket?.id ? 'bg-purple-500/20' : ''
											}`}
										>
											<TableHead>{packet.id}</TableHead>
											<TableHead>{packet.source}</TableHead>
											<TableHead>{packet.state}</TableHead>
											<TableHead>{packet.type}</TableHead>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</ResizablePanel>
					<ResizableHandle />
					<ResizablePanel className='p-4'>
						{!!selectedPacket && (
							<div className='flex flex-col space-y-4'>
								<div className='flex items-center justify-between'>
									<div className='text-muted-foreground'>ID</div>
									<div>{selectedPacket.id}</div>
								</div>
								<div className='flex items-center justify-between'>
									<div className='text-muted-foreground'>Source</div>
									<div>{selectedPacket.source}</div>
								</div>
								<div className='flex items-center justify-between'>
									<div className='text-muted-foreground'>Type</div>
									<div>{selectedPacket.type}</div>
								</div>
								<div className='flex items-center justify-between'>
									<div className='text-muted-foreground'>State</div>
									<div>{selectedPacket.state}</div>
								</div>

								<div>
									<div className='text-muted-foreground'>JSON</div>
									<pre className='whitespace-pre-wrap break-all select-text rounded-lg mt-2'>
										{JSON.stringify(selectedPacket, null, 2)}
									</pre>
								</div>
							</div>
						)}

						{!selectedPacket && (
							<div className='flex items-center justify-center h-full'>
								<p className='text-muted-foreground'>Select a packet to view details</p>
							</div>
						)}
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	);
}

export default App;
