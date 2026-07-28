// @flow
import type { Position } from 'css-box-model';
import * as timings from '../../debug/timings';
import type { StartPublishingResult } from './dimension-marshal-types';
import type {
  Registry,
  DraggableEntry,
  DroppableEntry,
} from '../registry/registry-types';
import { toDraggableMap, toDroppableMap } from '../dimension-structures';
import type {
  DroppableDescriptor,
  DroppableDimension,
  DraggableDimension,
  DimensionMap,
  ScrollOptions,
  Critical,
  Viewport,
} from '../../types';
import getViewport from '../../view/window/get-viewport';
import type { DragDropEnvironment } from '../../view/environment';

type Args = {|
  critical: Critical,
  scrollOptions: ScrollOptions,
  registry: Registry,
  environment?: ?DragDropEnvironment,
|};

export default ({
  critical,
  scrollOptions,
  registry,
  environment,
}: Args): StartPublishingResult => {
  const timingKey: string = 'Initial collection from DOM';
  timings.start(timingKey);
  const viewport: Viewport = getViewport(environment);
  const windowScroll: Position = viewport.scroll.current;

  const home: DroppableDescriptor = critical.droppable;

  const droppables: DroppableDimension[] = registry.droppable
    .getAllByType(home.type)
    .map((entry: DroppableEntry): DroppableDimension =>
      entry.callbacks.getDimensionAndWatchScroll(windowScroll, scrollOptions),
    );

  const draggables: DraggableDimension[] = registry.draggable
    .getAllByType(critical.draggable.type)
    .map((entry: DraggableEntry): DraggableDimension =>
      entry.getDimension(windowScroll),
    );

  const dimensions: DimensionMap = {
    draggables: toDraggableMap(draggables),
    droppables: toDroppableMap(droppables),
  };

  timings.finish(timingKey);

  const result: StartPublishingResult = {
    dimensions,
    critical,
    viewport,
  };

  return result;
};
