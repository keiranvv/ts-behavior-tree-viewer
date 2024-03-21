'use client'

import { BehaviorTreeTree } from '@/components/tree'
import {
	ActionNode,
	Node,
	NodeStatus,
	RepeatNode,
	SequenceNode,
	SequenceWithMemoryNode,
	Tree,
} from '@ts-behavior-tree'
import { useCallback, useEffect, useRef, useState } from 'react'

class DelayActionNode extends ActionNode {
	isrunning = false
	iscompleted = false

	tick() {
		if (this.iscompleted) {
			return NodeStatus.SUCCESS
		}

		if (!this.isrunning) {
			this.isrunning = true

			setTimeout(() => {
				this.isrunning = false
				this.iscompleted = true
			}, 3000)
		}

		return NodeStatus.RUNNING
	}

	override resetStatus(): void {
		this.isrunning = false
		this.iscompleted = false
		super.resetStatus()
	}
}

class SuccessActionNode extends ActionNode {
	tick() {
		return NodeStatus.SUCCESS
	}
}

export default function Home() {
	const [tree, setTree] = useState<Tree | null>(null)
	const [logs, setLogs] = useState<string[]>([])
	const tickCount = useRef(0)
	const logsRef = useRef<HTMLDivElement>(null)
	const [isRunning, setIsRunning] = useState(false)

	const log = useCallback((message: string) => {
		setLogs((prev) => [...prev, message])
		if (logsRef.current) {
			logsRef.current.scrollTo(0, logsRef.current.scrollHeight)
		}
	}, [])

	useEffect(() => {
		const repeatNode = new RepeatNode(new SuccessActionNode())
		const rootNode = new SequenceWithMemoryNode([
			new SequenceWithMemoryNode([repeatNode, new DelayActionNode()]),
			new DelayActionNode(),
			new DelayActionNode(),
		])

		const t = new Tree(rootNode)

		repeatNode.write_output('num_cycles', 5)

		t.on('nodeStatusChanged', (node: Node) => {
			log(`${node.constructor.name}: ${node.prevStatus} -> ${node.status}`)
		})

		t.on('end', () => {
			log('Completed')
			setIsRunning(false)
		})

		t.on('start', () => {
			log('Start')
			setIsRunning(true)
		})

		tickCount.current = 0

		setTree(t)
		// t.tickWhileRunning()

		return () => {
			t.removeAllListeners()
			tickCount.current = 0
		}
	}, [log])

	const handleStartClick = useCallback(() => {
		tickCount.current = 0
		tree?.tickWhileRunning()
	}, [tree])

	const handleStopClick = useCallback(() => {
		tickCount.current = 0
		tree?.halt()
	}, [tree])

	return (
		<main className="flex items-start bg-zinc-950 h-screen">
			<div
				ref={logsRef}
				className="text-xs leading-normal p-12 text-white text-opacity-70 font-mono bg-black bg-opacity-20 h-full w-[32rem] overflow-y-auto scroll-smooth"
			>
				{logs.length === 0 ? <div>Waiting for logs...</div> : null}
				{logs.map((log, index) => (
					<div key={index}>{log}</div>
				))}
			</div>
			{tree ? (
				<div className="flex-1 p-8">
					<h1>Behaviour Tree Viewer</h1>
					<div className="absolute flex flex-col gap-4">
						{isRunning ? (
							<button onClick={handleStopClick}>Halt</button>
						) : (
							<button onClick={handleStartClick}>Start</button>
						)}
					</div>
					<div className="p-16">
						<BehaviorTreeTree tree={tree} />
					</div>
				</div>
			) : null}
		</main>
	)
}
