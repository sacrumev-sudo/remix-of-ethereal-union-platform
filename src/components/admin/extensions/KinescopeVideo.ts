import { Node, mergeAttributes } from '@tiptap/core';

export interface KinescopeVideoOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    kinescopeVideo: {
      setKinescopeVideo: (options: { src: string; videoId: string }) => ReturnType;
    };
  }
}

export const KinescopeVideo = Node.create<KinescopeVideoOptions>({
  name: 'kinescopeVideo',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'kinescope-video my-4 rounded-lg overflow-hidden',
      },
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      videoId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-kinescope-id]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          const videoId = el.getAttribute('data-kinescope-id');
          return {
            videoId,
            src: `https://kinescope.io/embed/${videoId}`,
          };
        },
      },
      {
        tag: 'iframe[src*="kinescope.io"]',
        getAttrs: (element) => {
          const el = element as HTMLIFrameElement;
          const src = el.getAttribute('src') || '';
          const match = src.match(/kinescope\.io\/embed\/([a-zA-Z0-9-]+)/);
          const videoId = match ? match[1] : null;
          return {
            videoId,
            src,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const videoId = HTMLAttributes.videoId || '';
    const src = HTMLAttributes.src || `https://kinescope.io/embed/${videoId}`;
    
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-kinescope-id': videoId,
      }),
      [
        'div',
        { class: 'relative w-full', style: 'padding-top: 56.25%;' },
        [
          'iframe',
          {
            src,
            class: 'absolute top-0 left-0 w-full h-full border-0 rounded-lg',
            frameborder: '0',
            allowfullscreen: 'true',
            allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media',
          },
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setKinescopeVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ({ node, editor }) => {
      const container = document.createElement('div');
      container.className = 'kinescope-video my-4 rounded-lg overflow-hidden';
      container.setAttribute('data-kinescope-id', node.attrs.videoId || '');
      
      const wrapper = document.createElement('div');
      wrapper.className = 'relative w-full';
      wrapper.style.paddingTop = '56.25%';
      
      const iframe = document.createElement('iframe');
      iframe.src = node.attrs.src || `https://kinescope.io/embed/${node.attrs.videoId}`;
      iframe.className = 'absolute top-0 left-0 w-full h-full border-0 rounded-lg';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
      
      // Make iframe non-interactive in edit mode to allow selection
      if (editor.isEditable) {
        iframe.style.pointerEvents = 'none';
      }
      
      wrapper.appendChild(iframe);
      container.appendChild(wrapper);
      
      return {
        dom: container,
      };
    };
  },
});

export default KinescopeVideo;
