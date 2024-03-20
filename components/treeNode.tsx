import { Node, NodeStatus } from '@ts-behavior-tree'
import classNames from 'classnames'
import { Fragment, forwardRef, useState } from 'react'

const TreeNodeWithRef = forwardRef(function TreeNode({ node }: { node: Node }, ref: any) {
	const [childRefs, setChildRefs] = useState<HTMLDivElement[]>([])

	return (
		<div className="flex flex-col gap-16 items-center relative" ref={ref}>
			{childRefs.length > 0 ? (
				<svg className="absolute w-full">
					<line x1="50%" y1="48" x2="50%" y2="50%" stroke="white" strokeWidth={2} />
					{childRefs.map((el: HTMLDivElement, index: number) => {
						if (index === Math.floor(childRefs.length / 2) && childRefs.length % 2 !== 0) {
							return (
								<line
									key={`line_${index}`}
									x1={el.offsetLeft + el.clientWidth / 2}
									y1="50%"
									x2={el.offsetLeft + el.clientWidth / 2}
									y2={el.offsetTop}
									stroke="white"
									strokeWidth={2}
								/>
							)
						}

						return (
							<Fragment key={`line_${index}_1`}>
								<line
									x1="50%"
									y1="50%"
									x2={el.offsetLeft + el.clientWidth / 2}
									y2="50%"
									stroke="white"
									strokeWidth={2}
								/>

								<line
									x1={el.offsetLeft + el.clientWidth / 2}
									y1="50%"
									x2={el.offsetLeft + el.clientWidth / 2}
									y2={el.offsetTop}
									stroke="white"
									strokeWidth={2}
								/>
							</Fragment>
						)
					})}
				</svg>
			) : null}
			<div className="p-3 border rounded-md bg-gradient-to-t from-gray-950 to-gray-900 border-gray-800 relative">
				{node.displayName}
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
