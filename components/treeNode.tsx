import { Node, NodeStatus } from '@ts-behavior-tree'
import classNames from 'classnames'
import { Fragment, forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'

const TreeNodeWithRef = forwardRef(function TreeNode({ node }: { node: Node }, ref: any) {
	const [childRefs, setChildRefs] = useState<HTMLDivElement[]>([])
	const itemRef = useRef<HTMLDivElement>(null)
	const [tickCount, setTickCount] = useState(0)

	useEffect(() => {
		node.on('tick_executed', (n: Node) => {
			setTickCount((prev) => prev + 1)
		})

		node.on('status_changed', (n: Node) => {
			if (n.status === NodeStatus.IDLE) {
				setTickCount(0)
			}
		})

		return () => {
			node.removeAllListeners()
		}
	}, [node])

	return (
		<div className="flex flex-col gap-16 items-center relative" ref={ref}>
			{childRefs.length > 0 ? (
				<svg className="absolute w-full">
					<line
						x1="50%"
						y1={itemRef.current?.offsetHeight ?? 48}
						x2="50%"
						y2={(childRefs[0].offsetTop + (itemRef.current?.offsetHeight ?? 68)) / 2}
						stroke="#FFFFFF22"
						strokeWidth={2}
					/>
					{childRefs.map((el: HTMLDivElement, index: number) => {
						const yMid = (el.offsetTop + (itemRef.current?.offsetHeight ?? 68)) / 2
						if (index === Math.floor(childRefs.length / 2) && childRefs.length % 2 !== 0) {
							return (
								<line
									key={`line_${index}`}
									x1={el.offsetLeft + el.clientWidth / 2}
									y1={yMid}
									x2={el.offsetLeft + el.clientWidth / 2}
									y2={el.offsetTop}
									stroke="#FFFFFF22"
									strokeWidth={2}
								/>
							)
						}

						return (
							<Fragment key={`line_${index}_1`}>
								<line
									x1="50%"
									y1={yMid}
									x2={el.offsetLeft + el.clientWidth / 2}
									y2={yMid}
									stroke="#FFFFFF22"
									strokeWidth={2}
								/>

								<line
									x1={el.offsetLeft + el.clientWidth / 2}
									y1={yMid}
									x2={el.offsetLeft + el.clientWidth / 2}
									y2={el.offsetTop}
									stroke="#FFFFFF22"
									strokeWidth={2}
								/>
							</Fragment>
						)
					})}
				</svg>
			) : null}
			<div
				className="p-3 border rounded-md bg-gradient-to-t from-gray-900 to-gray-800 border-gray-700 relative"
				ref={itemRef}
			>
				<div>{node.displayName}</div>
				<div className="flex justify-between">
					<small className="opacity-50 font-medium">{node.uuid}</small>
					<small className="opacity-50 font-medium">{tickCount}</small>
				</div>
				<div
					className={classNames(
						'absolute -bottom-1.5 -right-4 text-xs font-bold rounded-md px-2 h-4 text-white uppercase',
						{
							'bg-green-600': node.status === NodeStatus.SUCCESS,
							'bg-red-500': node.status === NodeStatus.FAILURE,
							'bg-yellow-600': node.status === NodeStatus.RUNNING,
							'bg-gray-600': node.status === NodeStatus.IDLE,
						}
					)}
				>
					{node.status}
				</div>
			</div>
			<div className="flex gap-8">
				{node.getChildNodes(1).map((childNode: Node, i) =>
					childNode ? (
						<TreeNodeWithRef
							ref={(r: any) => {
								setChildRefs((refs) => {
									refs[i] = r
									return refs
								})
							}}
							key={childNode.uuid}
							node={childNode}
						/>
					) : null
				)}
			</div>
		</div>
	)
})

export default TreeNodeWithRef
