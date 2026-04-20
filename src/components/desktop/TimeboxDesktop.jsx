import React from 'react';
import Header from '../shared/Header';
import BrainDump from '../shared/BrainDump';
import Priorities from '../shared/Priorities';
import TimeBlockSection from '../shared/TimeBlockSection';
import HistorySection from '../shared/HistorySection';

export default function TimeboxDesktop({ timebox, onSignOut }) {
  const {
    data,
    selectedDate,
    setSelectedDate,
    currentData,
    draggedItem,
    isSaving,
    lastSyncError,
    profile,
    updateProfile,
    addBrainDumpItem,
    updateBrainDumpItem,
    removeBrainDumpItem,
    moveToPriority,
    updatePriority,
    removePriority,
    movePriorityToBlock,
    handleBrainDumpKeyDown,
    handlePriorityDragStart,
    handlePriorityDragOver,
    handlePriorityDrop,
    handleTimeBlockDragStart,
    handleTimeBlockDragOver,
    handleTimeBlockDrop,
    handleDragEnd,
    toggleTaskDone,
    removeFromTimeBlock,
    navigateDate,
  } = timebox;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      <Header
        profile={profile}
        updateProfile={updateProfile}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        navigateDate={navigateDate}
        isSaving={isSaving}
        lastSyncError={lastSyncError}
        onSignOut={onSignOut}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 space-y-6">
          <BrainDump
            items={currentData.brainDump}
            priorities={currentData.priorities}
            onAdd={addBrainDumpItem}
            onUpdate={updateBrainDumpItem}
            onRemove={removeBrainDumpItem}
            onMoveToPriority={moveToPriority}
            onKeyDown={handleBrainDumpKeyDown}
          />
          <Priorities
            priorities={currentData.priorities}
            timeBlocks={currentData.timeBlocks}
            draggedItem={draggedItem}
            onDragStart={handlePriorityDragStart}
            onDragOver={handlePriorityDragOver}
            onDrop={handlePriorityDrop}
            onDragEnd={handleDragEnd}
            onUpdate={updatePriority}
            onRemove={removePriority}
            onMoveToBlock={movePriorityToBlock}
          />
        </div>

        <div className="col-span-7">
          <div className="bg-white rounded-lg shadow-sm p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-2">
              Time Blocks
            </h2>

            <div className="space-y-6">
              <TimeBlockSection
                title="오전"
                timeRange="10:00 - 13:00"
                blockKey="morning"
                items={currentData.timeBlocks.morning}
                draggedItem={draggedItem}
                onDragOver={handleTimeBlockDragOver}
                onDrop={handleTimeBlockDrop}
                onItemDragStart={handleTimeBlockDragStart}
                onItemDragEnd={handleDragEnd}
                onToggleDone={toggleTaskDone}
                onRemove={removeFromTimeBlock}
              />
              <TimeBlockSection
                title="오후 1"
                timeRange="14:00 - 16:30"
                blockKey="afternoon1"
                items={currentData.timeBlocks.afternoon1}
                draggedItem={draggedItem}
                onDragOver={handleTimeBlockDragOver}
                onDrop={handleTimeBlockDrop}
                onItemDragStart={handleTimeBlockDragStart}
                onItemDragEnd={handleDragEnd}
                onToggleDone={toggleTaskDone}
                onRemove={removeFromTimeBlock}
              />
              <TimeBlockSection
                title="오후 2"
                timeRange="16:30 - 19:00"
                blockKey="afternoon2"
                items={currentData.timeBlocks.afternoon2}
                draggedItem={draggedItem}
                onDragOver={handleTimeBlockDragOver}
                onDrop={handleTimeBlockDrop}
                onItemDragStart={handleTimeBlockDragStart}
                onItemDragEnd={handleDragEnd}
                onToggleDone={toggleTaskDone}
                onRemove={removeFromTimeBlock}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <HistorySection data={data} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      </div>
    </div>
  );
}
