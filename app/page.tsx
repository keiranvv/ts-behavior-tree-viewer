'use client'

import { BehaviorTreeTree } from '@/components/tree'
import { ActionNode, Node, NodeStatus, RepeatNode, SequenceNode, Tree } from '@ts-behavior-tree'
import { useCallback, useEffect, useRef, useState } from 'react'

class SampleActionNode extends ActionNode {
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

export default function Home() {
	const [tree, setTree] = useState<Tree | null>(null)
	const [logs, setLogs] = useState<string[]>([])
	const tickCount = useRef(0)
	const logsRef = useRef<HTMLDivElement>(null)

	const log = useCallback((message: string) => {
		setLogs((prev) => [...prev, message])
		if (logsRef.current) {
			logsRef.current.scrollTo(0, logsRef.current.scrollHeight)
		}
	}, [])

	useEffect(() => {
		const repeatNode = new RepeatNode(new SampleActionNode())
		const rootNode = new SequenceNode([
			new SequenceNode([repeatNode, new SampleActionNode()]),
			new SampleActionNode(),
			new SampleActionNode(),
		])

		const t = new Tree(rootNode)

		repeatNode.write_output('num_cycles', 5)

		t.on('tick', () => {
			tickCount.current++
		})

		t.on('tick', () => {
			log(`Tick ${tickCount.current}`)
		})

		t.on('nodeStatusChanged', (node: Node) => {
			log(`${node.constructor.name}: ${node.prevStatus} -> ${node.status}`)
		})

		tickCount.current = 0

		setTree(t)
		// t.tickWhileRunning()

		return () => {
			t.removeAllListeners()
			tickCount.current = 0
		}
	}, [log])

	const handleRunAgainClick = useCallback(() => {
		tickCount.current = 0
		tree?.tickWhileRunning()
	}, [tree])

	return (
		<main className="flex items-start bg-zinc-950 min-h-screen">
			<div
				ref={logsRef}
				className="mt-4 text-xs leading-normal p-12 text-white text-opacity-70 font-mono bg-black bg-opacity-20 h-screen w-[32rem] overflow-y-auto scroll-smooth"
			>
				{logs.map((log, index) => (
					<div key={index}>{log}</div>
				))}
			</div>
			{tree ? (
				<div className="flex-1">
					<div className="absolute p-8 flex flex-col gap-4">
						<button onClick={handleRunAgainClick}>Start</button>
					</div>
					<div className="p-24">
						<BehaviorTreeTree tree={tree} />
					</div>
				</div>
			) : null}
		</main>
	)
}
