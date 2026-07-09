"use client";

import { useState } from "react";
import { LearningBlock, Module, Course } from "@/types";
import { Button } from "@/components/ui/button";
import { createBlockAction, updateBlockAction, deleteBlockAction, reorderBlocksAction } from "@/app/actions/store";
import { generateBlockAction } from "@/app/actions/ai";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableBlock } from "./sortable-block";
import { BlockEditor } from "./block-editor";
import { GenerateBlockModal } from "./generate-block-modal";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function CourseBuilder({ 
  course, 
  module, 
  blocks,
  setBlocks
}: { 
  course: Course; 
  module: Module; 
  blocks: LearningBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<LearningBlock[]>>;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [showAddTypeSelector, setShowAddTypeSelector] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const handleDragEnd = async (event: DragEndEvent) => {
    // ... existing drag logic ...
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        reorderBlocksAction(module.id, newOrder.map(b => b.id), course.id);
        return newOrder;
      });
    }
  };

  const handleGenerateBlock = async (type: LearningBlock["type"], prompt: string) => {
    const toastId = toast.loading("Generating block with AI...");
    try {
      const context = blocks.length > 0 ? blocks[blocks.length - 1].content : "";
      const partialBlock = await generateBlockAction({
        type,
        courseTopic: course.title,
        moduleObjective: module.learningObjectives?.[0] || module.title,
        context,
        prompt,
      });

      const newBlock = await createBlockAction(course.id, {
        moduleId: module.id,
        type: partialBlock.type || type,
        title: partialBlock.title || 'Generated Block',
        content: partialBlock.content || '',
        learningMode: partialBlock.learningMode || 'understand',
        source: 'ai_assisted',
      });

      setBlocks([...blocks, newBlock]);
      toast.success("Block generated successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to generate block:", error);
      toast.error("Failed to generate block", { id: toastId });
    }
  };

  const handleAddManualBlock = async (type: LearningBlock["type"]) => {
    let defaultContent = "Write your reading content here...";
    let learningMode: LearningBlock["learningMode"] = "understand";
    
    if (type === "quiz") {
      defaultContent = JSON.stringify({ question: "Sample Question?", options: ["Option A", "Option B", "Option C"], correctAnswer: "Option A", explanation: "Explanation..." });
      learningMode = "test";
    } else if (type === "reflection") {
      defaultContent = JSON.stringify({ reflectionPrompt: "Reflect on this module.", followUpQuestions: [] });
      learningMode = "reflect";
    } else if (type === "audio") {
      defaultContent = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
      learningMode = "understand";
    } else if (type === "video") {
      defaultContent = "https://www.youtube.com/embed/dQw4w9WgXcQ";
      learningMode = "understand";
    } else if (type === "code") {
      defaultContent = "// Write your code here";
      learningMode = "apply";
    } else if (type === "punk_game") {
      defaultContent = JSON.stringify({ scenario: "Brief setup...", task: "Action plan...", timeboxMinutes: 10, evaluationCriteria: ["Criteria 1"] });
      learningMode = "challenge";
    } else if (type === "project_task") {
      defaultContent = JSON.stringify({ title: "Project Assignment", scenario: "Write a case study...", task: "Deliver a mockup...", deliverable: "Mockup file", constraints: [], reflectionPrompt: "How did it go?" });
      learningMode = "apply";
    }

    const newBlock = await createBlockAction(course.id, {
      moduleId: module.id,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Block`,
      content: defaultContent,
      source: 'trainer',
      learningMode
    });
    setBlocks([...blocks, newBlock]);
    setEditingBlockId(newBlock.id);
    setShowAddTypeSelector(false);
  };

  const handleSaveEdit = async (id: string, content: string, title?: string) => {
    const updateData: any = { content };
    if (title) updateData.title = title;
    const updated = await updateBlockAction(course.id, module.id, id, updateData);
    setBlocks(blocks.map(b => b.id === id ? updated : b));
    setEditingBlockId(null);
    toast.success("Changes saved");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this block?")) {
      await deleteBlockAction(course.id, module.id, id);
      setBlocks(blocks.filter(b => b.id !== id));
      toast.success("Block deleted");
    }
  };

  const contextPreview = blocks.length > 0 ? blocks[blocks.length - 1].content : "";

  return (
    <div className="space-y-4">
      <DndContext id="course-builder-dnd-context" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map(block => (
            <SortableBlock key={block.id} id={block.id}>
              <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200 group">
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-500 rounded">
                    {block.type}
                  </span>
                  {block.source === "ai_assisted" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-emerald-green/10 text-emerald-green rounded">
                      ✨ AI Generated
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-semibold text-lg text-slate-800 mb-2">{block.title}</h3>
                
                {editingBlockId === block.id ? (
                  <BlockEditor 
                    block={block} 
                    onSave={handleSaveEdit} 
                    onCancel={() => setEditingBlockId(null)} 
                    courseTitle={course.title}
                    moduleTitle={module.title}
                    moduleDescription={module.description}
                  />
                ) : (
                  <div className="text-slate-600 prose prose-sm max-w-none">
                    {block.type === 'quiz' || block.type === 'reflection' || block.type === 'code' || block.type === 'project_task' || block.type === 'punk_game' ? (
                       <pre className="p-4 bg-slate-50 rounded text-xs overflow-x-auto">
                         {block.content}
                       </pre>
                    ) : block.type === 'video' ? (
                      <div className="aspect-video max-w-sm bg-slate-900 flex items-center justify-center rounded-xl border border-slate-200 overflow-hidden relative shadow-sm">
                        {block.content && (block.content.includes("youtube.com") || block.content.includes("youtu.be") || block.content.includes("vimeo.com") || block.content.includes("embed")) ? (
                          <iframe 
                            src={block.content} 
                            className="w-full h-full border-none pointer-events-none"
                            allowFullScreen
                          />
                        ) : block.content ? (
                          <video 
                            src={block.content} 
                            className="w-full h-full object-contain"
                            preload="metadata"
                            muted
                          />
                        ) : (
                          <span className="text-slate-400 text-xs uppercase font-bold font-mono">Kein Video hinterlegt</span>
                        )}
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                          <span className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-slate-800 shadow-md">Video Vorschau</span>
                        </div>
                      </div>
                    ) : (
                      block.content
                    )}
                  </div>
                )}

                {editingBlockId !== block.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingBlockId(block.id)}>
                        Edit
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(block.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </SortableBlock>
          ))}
        </SortableContext>
      </DndContext>
      
      {blocks.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
          <p className="text-slate-500 mb-4">This module is empty. Add your first learning block.</p>
        </div>
      )}
      
      <div className="pt-4 flex flex-col items-center gap-4">
        {showAddTypeSelector ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap justify-center gap-2 max-w-xl animate-in fade-in zoom-in-95">
            {(["text", "audio", "video", "quiz", "reflection", "code", "punk_game", "project_task"] as LearningBlock["type"][]).map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className="text-xs capitalize font-semibold"
                onClick={() => handleAddManualBlock(type)}
              >
                {type === "text" ? "📝 Text" :
                 type === "audio" ? "📻 Audio" :
                 type === "video" ? "🎥 Video" :
                 type === "quiz" ? "❓ Quiz" :
                 type === "reflection" ? "🧠 Reflection" :
                 type === "code" ? "💻 Code" :
                 type === "punk_game" ? "🎮 Challenge" :
                 "📁 Project"}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 font-bold"
              onClick={() => setShowAddTypeSelector(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" className="border-dashed border-2" onClick={() => setShowAddTypeSelector(true)}>
              + Add Block Manually
            </Button>
            <Button 
              variant="outline" 
              className="border-dashed border-2 text-emerald-green border-emerald-green/50 hover:bg-emerald-green/5"
              onClick={() => setIsGenerateModalOpen(true)}
            >
              ✨ Generate Block
            </Button>
          </div>
        )}
      </div>

      <GenerateBlockModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)} 
        onGenerate={handleGenerateBlock}
        moduleObjective={module.learningObjectives?.[0] || module.title}
        contextPreview={contextPreview}
      />
    </div>
  );
}
