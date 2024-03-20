import { Tree } from '@ts-behavior-tree'
import TreeNode from './treeNode'

export function BehaviorTreeTree({ tree }: { tree: Tree }) {
	if (!tree.rootNode) {
		return 'No root node found.'
	}

	return (
		<div className="font-semibold">
			<TreeNode node={tree.rootNode} />
		</div>
	)
}
