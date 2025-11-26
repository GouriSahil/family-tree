import { useState, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
} from 'reactflow';
import html2canvas from 'html2canvas';
import 'reactflow/dist/style.css';
import FamilyNode from './components/FamilyNode';
import AddMemberModal from './components/AddMemberModal';
import MemberDetailsModal from './components/MemberDetailsModal';
import './App.css';

// Custom node types
const nodeTypes = {
  familyNode: FamilyNode,
};

// Initial sample data (will be replaced with API data later)
// Top-to-bottom layout: Generation 1 at top, children below
const initialNodes = [
  {
    id: '1',
    type: 'familyNode',
    position: { x: 500, y: 50 },
    data: {
      name: 'Father',
      photo: 'https://via.placeholder.com/80/4A90E2/ffffff?text=FA',
      gender: 'male',
      id: '1',
    },
  },
  {
    id: '2',
    type: 'familyNode',
    position: { x: 300, y: 200 },
    data: {
      name: 'Wife 1',
      photo: 'https://via.placeholder.com/80/E94B8B/ffffff?text=W1',
      gender: 'female',
      id: '2',
    },
  },
  {
    id: '3',
    type: 'familyNode',
    position: { x: 700, y: 200 },
    data: {
      name: 'Wife 2',
      photo: 'https://via.placeholder.com/80/E94B8B/ffffff?text=W2',
      gender: 'female',
      id: '3',
    },
  },
  {
    id: '4',
    type: 'familyNode',
    position: { x: 250, y: 400 },
    data: {
      name: 'Child 1',
      photo: 'https://via.placeholder.com/80/50C878/ffffff?text=C1',
      gender: 'male',
      id: '4',
      motherId: '2',
      fatherId: '1',
    },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', style: { stroke: '#8B5CF6', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', style: { stroke: '#8B5CF6', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', style: { stroke: '#10B981', strokeWidth: 2 } },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
  const reactFlowWrapper = useRef(null);

  // Handle node click to show details
  const onNodeClick = useCallback((event, node) => {
    setSelectedMember(node.data);
    setIsDetailsModalOpen(true);
  }, []);

  // Handle edge connection
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // Filter nodes based on search
  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes;
    const term = searchTerm.toLowerCase();
    return nodes.filter((node) =>
      node.data.name.toLowerCase().includes(term)
    );
  }, [nodes, searchTerm]);

  // Highlight searched nodes
  const nodesWithHighlight = useMemo(() => {
    return nodes.map((node) => {
      const isHighlighted = filteredNodes.some((n) => n.id === node.id);
      return {
        ...node,
        style: {
          ...node.style,
          opacity: searchTerm && !isHighlighted ? 0.3 : 1,
        },
      };
    });
  }, [nodes, filteredNodes, searchTerm]);

  // Calculate position for new node (top-to-bottom layout)
  const calculateNewPosition = useCallback((parentNode, existingNodes) => {
    if (!parentNode) {
      // If no parent, find a good position
      const maxY = existingNodes.length > 0 
        ? Math.max(...existingNodes.map(n => n.position.y)) 
        : 0;
      return { x: 400, y: maxY + 200 };
    }

    // Find children of the parent to position new node
    const parentChildren = existingNodes.filter(node => {
      const hasParentConnection = edges.some(edge => 
        edge.target === node.id && (edge.source === parentNode.id || 
        (node.data.motherId === parentNode.id) || 
        (node.data.fatherId === parentNode.id))
      );
      return hasParentConnection;
    });

    // Position new child below parent
    const baseY = parentNode.position.y + 200;
    const spacing = 150;
    const xOffset = (parentChildren.length - 1) * spacing / 2;
    const x = parentNode.position.x - xOffset + (parentChildren.length * spacing);

    return { x, y: baseY };
  }, [edges]);

  // Add new family member
  const handleAddMember = useCallback((memberData) => {
    const newId = String(Date.now());
    const newPosition = calculateNewPosition(selectedParent, nodes);
    
    const newNode = {
      id: newId,
      type: 'familyNode',
      position: newPosition,
      data: {
        ...memberData,
        id: newId,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    // Create edges based on relationships
    const newEdges = [];
    if (memberData.fatherId) {
      newEdges.push({
        id: `e${memberData.fatherId}-${newId}`,
        source: memberData.fatherId,
        target: newId,
        type: 'smoothstep',
        style: { stroke: '#8B5CF6', strokeWidth: 2 },
      });
    }
    if (memberData.motherId) {
      newEdges.push({
        id: `e${memberData.motherId}-${newId}`,
        source: memberData.motherId,
        target: newId,
        type: 'smoothstep',
        style: { stroke: '#10B981', strokeWidth: 2 },
      });
    }

    if (newEdges.length > 0) {
      setEdges((eds) => [...eds, ...newEdges]);
    }

    setSelectedParent(null);
    setIsAddModalOpen(false);
  }, [selectedParent, setNodes, setEdges, nodes, calculateNewPosition]);

  // Update member
  const handleUpdateMember = useCallback((memberData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === memberData.id
          ? { ...node, data: { ...node.data, ...memberData } }
          : node
      )
    );
    setIsDetailsModalOpen(false);
    setSelectedMember(null);
  }, [setNodes]);

  // Delete member
  const handleDeleteMember = useCallback((memberId) => {
    setNodes((nds) => nds.filter((node) => node.id !== memberId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== memberId && edge.target !== memberId)
    );
    setIsDetailsModalOpen(false);
    setSelectedMember(null);
  }, [setNodes, setEdges]);

  // Export as image
  const handleExport = useCallback(async () => {
    const flowElement = document.querySelector('.react-flow');
    if (flowElement) {
      try {
        const canvas = await html2canvas(flowElement, {
          backgroundColor: '#0f172a',
          useCORS: true,
          scale: 2,
        });
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'family-tree.png';
        link.href = url;
        link.click();
      } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export image. Please try again.');
      }
    }
  }, []);

  // Open add modal with parent selection
  const handleAddWithParent = useCallback((parentNode) => {
    setSelectedParent(parentNode);
    setIsAddModalOpen(true);
  }, []);

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="title">🌳 Family Tree</h1>
        <div className="header-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search family members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            onClick={() => {
              setSelectedParent(null);
              setIsAddModalOpen(true);
            }}
            className="btn btn-primary"
          >
            + Add Member
          </button>
          <button onClick={handleExport} className="btn btn-secondary">
            📥 Export
          </button>
        </div>
      </div>

      <div className="flow-container" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodesWithHighlight}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          attributionPosition="bottom-left"
          className="family-tree-flow"
          connectionLineStyle={{ stroke: '#8B5CF6', strokeWidth: 2 }}
          snapToGrid={true}
          snapGrid={[20, 20]}
        >
          <Background color="#2a2a2a" gap={16} />
          <Controls className="flow-controls" />
          <MiniMap
            nodeColor={(node) => {
              if (node.data?.gender === 'male') return '#4A90E2';
              if (node.data?.gender === 'female') return '#E94B8B';
              return '#50C878';
            }}
            className="flow-minimap"
          />
          <Panel position="top-right" className="info-panel">
            <div className="info-card">
              <h3>Family Tree</h3>
              <p>Total Members: {nodes.length}</p>
              <p>Click on a node to view details</p>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {isAddModalOpen && (
        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedParent(null);
          }}
          onAdd={handleAddMember}
          existingMembers={nodes}
          selectedParent={selectedParent}
        />
      )}

      {isDetailsModalOpen && selectedMember && (
        <MemberDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedMember(null);
          }}
          member={selectedMember}
          onUpdate={handleUpdateMember}
          onDelete={handleDeleteMember}
          onAddChild={(parent) => {
            setIsDetailsModalOpen(false);
            const parentNode = nodes.find((n) => n.id === parent.id);
            handleAddWithParent(parentNode);
          }}
        />
      )}
    </div>
  );
}

function AppWithProvider() {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  );
}

export default AppWithProvider;
