import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router, NavigationExtras, Params } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { fabric } from 'fabric';
import Sortable from 'sortablejs/modular/sortable.complete.esm.js';
import { RestService } from '../../services/rest.service';
import { Chart } from 'chart.js';
import Swal from 'sweetalert2';
import { BrowserStack } from 'protractor/built/driverProviders';
import { NewBoardCard, PluginType } from './new-board-card';

// Importing Plugins
import { AddH1Component } from '../../plugins/cb-h1';
import { AddCanvasBoard } from '../../plugins/cb-whiteboard';
import { AddH2Component } from '../../plugins/cb-h2';
import { AddH3Component } from '../../plugins/cb-h3';
import { AddParaComponent } from '../../plugins/cb-p';
import { AddRedBackgroundComponent } from '../../plugins/color-background/cb-redbackground';
import { AddBlueBackgroundComponent } from '../../plugins/color-background/cb-bluebackground';
import { AddYellowBackgroundComponent } from '../../plugins/color-background/cb-yellowbackground';
import { AddGreenBackgroundComponent } from '../../plugins/color-background/cb-greenbackground';
import { AddClearBackgroundComponent } from '../../plugins/color-background/cb-clearbackground';

import { AddFontMonospaceComponent } from '../../plugins/monospace';
import { AddFontPlayfairComponent } from '../../plugins/playfair';
import { AddFontKalamComponent } from '../../plugins/kalam';
import { AddClearFontComponent } from '../../plugins/clear-font';
import { AddLeftAlignComponent } from '../../plugins/left-align';
import { AddCenterAlignComponent } from '../../plugins/center-align';
import { AddRightAlignComponent } from '../../plugins/right-align';
import { AddOrderedListComponent } from '../../plugins/ordered-list';
import { AddUnOrderedListComponent } from '../../plugins/unordered-list';
import { AddTopComponent } from '../../plugins/top';
import { AddBottomComponent } from '../../plugins/bottom';
import { AddDeleteComponent } from '../../plugins/delete';
import { AddEmbedComponent } from '../../plugins/embed';
import { AddPdfRenderComponent } from '../../plugins/pdf-render';
import { NewBoard } from 'src/interfaces/new-board';
import { each, param } from 'jquery';
import { TwitterData } from 'src/interfaces/twitterData';

declare var $: any;

@Component({
  selector: 'app-new-board',
  templateUrl: './new-board.component.html',
  styleUrls: ['./new-board.component.scss'],
})
export class NewBoardComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, private apiService: RestService, private router: Router) {
    this.activatedRoute.params.subscribe(params => { this.folderID = params.folderId; this.fileID = params.fileId; });
    if (this.router.getCurrentNavigation() !== null) {
      if (this.router.getCurrentNavigation().extras.state !== undefined) {
        this.fileData = this.router.getCurrentNavigation().extras.state.fileData;
        this.folderID = this.router.getCurrentNavigation().extras.state.folderId;
      }
    }
    // Initialize the Map
    this.userBlocks = new Map();

    this.AddH1Component = new AddH1Component();
    this.AddH2Component = new AddH2Component();
    this.AddH3Component = new AddH3Component();
    this.AddParaComponent = new AddParaComponent();
    this.AddRedBackgroundComponent = new AddRedBackgroundComponent();
    this.AddBlueBackgroundComponent = new AddBlueBackgroundComponent();
    this.AddYellowBackgroundComponent = new AddYellowBackgroundComponent();
    this.AddGreenBackgroundComponent = new AddGreenBackgroundComponent();
    this.AddClearBackgroundComponent = new AddClearBackgroundComponent();
    this.AddCanvasBoard = new AddCanvasBoard();
    this.AddFontMonospaceComponent = new AddFontMonospaceComponent();
    this.AddFontPlayfairComponent = new AddFontPlayfairComponent();
    this.AddFontKalamComponent = new AddFontKalamComponent();
    this.AddClearFontComponent = new AddClearFontComponent();
    this.AddLeftAlignComponent = new AddLeftAlignComponent();
    this.AddCenterAlignComponent = new AddCenterAlignComponent();
    this.AddRightAlignComponent = new AddRightAlignComponent();
    this.AddOrderedListComponent = new AddOrderedListComponent();
    this.AddUnOrderedListComponent = new AddUnOrderedListComponent();
    this.AddTopComponent = new AddTopComponent();
    this.AddBottomComponent = new AddBottomComponent();
    this.AddDeleteComponent = new AddDeleteComponent();
    this.AddEmbedComponent = new AddEmbedComponent();
    this.AddPdfRenderComponent = new AddPdfRenderComponent();
    this.reader = new FileReader();


  }

  fileName: string;
  fileID: Data;
  folderID: Data;
  fileData: NavigationExtras;
  fileTag: Array<string>;
  fileToUpload: File = null;

  reader: FileReader;
  currentChartID: string;
  userBlocks: Map<string, NewBoardCard>;
  // Initializing plugins
  AddH1Component: any;
  AddH2Component: any;
  AddH3Component: any;
  AddParaComponent: any;
  AddRedBackgroundComponent: any;
  AddBlueBackgroundComponent: any;
  AddYellowBackgroundComponent: any;
  AddGreenBackgroundComponent: any;
  AddClearBackgroundComponent: any;
  AddCanvasBoard: any;
  AddFontMonospaceComponent: any;
  AddFontPlayfairComponent: any;
  AddFontKalamComponent: any;
  AddClearFontComponent: any;
  AddLeftAlignComponent: any;
  AddCenterAlignComponent: any;
  AddRightAlignComponent: any;
  AddOrderedListComponent: any;
  AddUnOrderedListComponent: any;
  AddTopComponent: any;
  AddBottomComponent: any;
  AddDeleteComponent: any;
  AddEmbedComponent: any;
  AddPdfRenderComponent: any;

  uniqueChartID = (() => {
    let id = 0;
    return () => {
      return id++;
    };
  })();

  // Retrieve board data from Api
  async;


  ngOnInit() {

    // sortable-js
    const mainEl = document.getElementById('main-box');
    // let oldIdx: number;
    // let newIdx: number;
    const sortable = new Sortable(mainEl, {
      handle: '.dragHandle',
      animation: 150,
      easing: 'cubic-bezier(1, 0, 0, 1)',
      // onStart(evt) {
      //   oldIdx = evt.oldIndex;  // element index within parent
      // },
      // onEnd: (evt) => {
      //   newIdx = evt.newIndex - 2;

      //   if (oldIdx === 1) {
      //     if (this.userBlocks[oldIdx - 1].cardID === evt.clone.id.substring(9)) {
      //       this.arrayMoveMutate(this.userBlocks, 0, newIdx);
      //       this.userBlocks[0].updatePosition(0, newIdx);
      //     }

      //   } else {
      //     if (this.userBlocks[oldIdx - 2].cardID === evt.clone.id.substring(9)) {
      //       this.arrayMoveMutate(this.userBlocks, oldIdx - 2, newIdx);
      //       this.userBlocks[oldIdx - 2].updatePosition(oldIdx - 2, newIdx);

      //     }
      //   }}

    });

    // disable enter on title
    this.disableTitleEnter();

    // Enabling ToolTips for everything
    $(document).ready(() => {
      $('[data-toggle="tooltip"]').tooltip();
    });

    // ......................... DISABLING ENTER KEYWORD .........................
    $('#original[contenteditable]').keypress((evt) => {
      const keycode = evt.charCode || evt.keyCode;
      if (keycode === 13) {
        // Enter key's keycode
        return false;
      }
    });
    // console.log(this.fileID);
    if (this.fileData !== null && this.fileData !== undefined) {
      this.populateData(this.fileData.queryParams);

    } else if (this.fileID !== undefined) {
      this.retrieveData(this.fileID);
    } else {
      this.addBlockEditor('sub-title', 0);
    }
  }

  // ......................... BLOCK BUILDING FUNCITON............................
  blockFunction = (uid) => {
    const data = `
    <div id="cb-box-1-${uid}" class="cb-box-1">
    <div class="row mx-0">
      <!-- plug for dragging -->
      <div class="dragHandle col-1 col-cb-1-custom" style="padding: 0px; padding-top: 7px; max-width: 4%; flex: 0 0 4%;" title="Drag">
        <svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-grip-horizontal"
        fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7
          5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2
          0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0
          1 2 0z"/>
        </svg>
      </div>
      <div class="col-10 px-0" style="max-width: 90%; flex: 0 0 90%;">
        <!-- content box -->
        <div id="cb-box-2-${uid}" class="cb-box-2 mt-2 mb-2" style="margin-left: 3px; border-radius: 5px;">
          <div class="cb-box-3">
            <div id="original-${uid}" class="edit" contenteditable="true" style="padding-left: 3px;">

            </div>
          </div>
        </div>
      </div>
      <!-- menu icon -->
      <div id="show-more-toolbox-${uid}" class="col-1 px-0" style="max-width: 5%; flex: 0 0 5%;">
        <!-- menu button -->
        <div class="cb-toolbox" title="Toolbar">
         <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-three-dots" fill="currentColor"
         xmlns="http://www.w3.org/2000/svg">
         <path fill-rule="evenodd"
          d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
          />
         </svg>
        </div>

        <!-- expand toolbox -->
        <div id="cb-expand-more-toolbox-${uid}" class="cb-more-toolbox">
          <div id="cb-buttons-${uid}" class="toolbox-main shadow">
          </div>
        </div>
      </div>
    </div>
  </div>

    `;
    return data;
  }

  // .........................ADDING BLOCK AFTER THE DIV FUNCTION.................
  addBlockEditor = (id, checker, addBefore = false, embedUrl = null) => {
    try {
      // getting uid and appending after specified ID
      const uid: any = uuidv4();

      const newBoardCard: NewBoardCard = new NewBoardCard(uid, -1, this.userBlocks.size);
      let pluginType: PluginType;

      switch (checker) {
        case 0: {
          addBefore ? $(`#${id}`).before(this.blockFunction(uid)) : $(`#${id}`).after(this.blockFunction(uid));

          break;
        }
        case 1: {
          addBefore ? $(`#cb-box-1-${id}`).before(this.blockFunction(uid)) : $(`#cb-box-1-${id}`).after(this.blockFunction(uid));
          break;
        }
        case 2: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddH1Component.addH1TagToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 3: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddCanvasBoard.addCanvasBoardToolbox(uid);
          pluginType = 'board';
          break;
        }
        case 4: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddH2Component.addH2TagToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 5: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddH3Component.addH3TagToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 6: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddParaComponent.addParaTagToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 7: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddRedBackgroundComponent.addRedBackgroundToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 8: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddBlueBackgroundComponent.addBlueBackgroundToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 9: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddYellowBackgroundComponent.addYellowBackgroundToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 10: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddGreenBackgroundComponent.addGreenBackgroundToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 11: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddFontMonospaceComponent.addMonospaceFontToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 12: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddFontPlayfairComponent.addPlayfairFontToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 17: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddFontKalamComponent.addKalamFontToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 13: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddClearFontComponent.addClearFontToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 14: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddLeftAlignComponent.addLeftAlignTextToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 15: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddCenterAlignComponent.addCenterAlignTextToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 16: {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddRightAlignComponent.addRightAlignTextToolBox(uid);
          pluginType = 'editor';
          break;
        }
        case 19: {
          // PDF Render
          $('#pdfFile').change((event) => {
            $(`#${id}`).append(this.blockFunction(uid));
            this.AddPdfRenderComponent.addPdfRenderToolBox(uid, event.target.files[0], this.reader);
          });
          pluginType = 'fileUpload';
          break;
        }
        case 18: {
          if (embedUrl === null) {
          $(`#${id}`).append(this.blockFunction(uid));
          this.AddEmbedComponent.addEmbedToolBox(uid, $('#embedURL').val());
          pluginType = 'embed';
          newBoardCard.setContent($('#embedURL').val());
          } else {
            $(`#${id}`).append(this.blockFunction(uid));
            this.AddEmbedComponent.addEmbedToolBox(uid, embedUrl);
            pluginType = 'embed';
            newBoardCard.setContent(embedUrl);
          }
          break;
        }
        case 20: {
          if (embedUrl !== null && embedUrl !== undefined){
            $(`#${id}`).append(this.blockFunction(uid));
            this.AddEmbedComponent.addEmbedHtmlToolBox(uid, embedUrl);
            pluginType = 'tweet';
            newBoardCard.setContent(embedUrl);
          }
          break;
        }
        default:
          break;
      }

      // Adding listener to current card
      $(`#original-${uid}`).click(() => { this.currentChartID = uid; });

      // Changing focus to Current Card
      $(`#original-${uid}`).focus();

      // Setting current card id
      this.currentChartID = uid;

      // Setting Plugin Type to card
      newBoardCard.setpluginType(pluginType);

      // Adding to UserBlocks Map
      this.userBlocks.set(uid, newBoardCard);
      // this.userBlocks.push(newBoardCard);

      this.addToolBox(uid, checker);

      // // Add Canvasboard Tag
      // this.AddCanvasBoard.addCanvasBoardHTMLCode(uid);
      // this.AddCanvasBoard.addCanvasBoardClickFunction(uid);

      // Calling Add Canvas board function when addBefore is True
      if (addBefore) {

        // Adding Canvas board
        $(`#add-canvas-cb-${uid}`).click(() => {
          const parentWidth = $(`#original-${uid}`).width();
          $(`#original-${uid}`).append(`
          <div id="canvas-menu-box" class="canvas-menu-box">
             <input id="canvas-menu-box-${uid}" type="color" style="margin-left: 50%; margin-bottom: 5px;">
          </div>
          <canvas id="canvas-${uid}" class="shadow"></canvas>
        `);
          // This code(styles) should not be added it will cause problems in fabric

          const canvas = new fabric.Canvas(`canvas-${uid}`);
          canvas.isDrawingMode = true;
          canvas.setHeight('400');
          canvas.setWidth(parentWidth);

          // changing pen color
          // canvas.freeDrawingBrush.color
          $(`#canvas-menu-box-${uid}`).on('change', () => {
            const color: any = document.getElementById(`canvas-menu-box-${uid}`);
            const data = color.value;
            canvas.freeDrawingBrush.color = data;
          });
        });
      }



    } catch (err) {
      console.log('Error', err);
    }
  }

  addToolBox(uid, checker) {
    // hiding and showing the TOOLBOX
    $(`#show-more-toolbox-${uid}`).hover(
      // display block
      () => {
        $(`#cb-expand-more-toolbox-${uid}`).css('display', 'block');
      },
      //  display none
      () => {
        $(`#cb-expand-more-toolbox-${uid}`).css('display', 'none');
      }
    );

    // Add Delete HTML and click Function
    this.AddDeleteComponent.addDeleteTagHTMLCode(uid);
    this.AddDeleteComponent.addDeleteTagClickFunction(uid, checker);

    // Adding red background toolbox
    this.AddRedBackgroundComponent.addRedBackgroundHTMLCode(uid);
    this.AddRedBackgroundComponent.addRedBackgroundClickFunction(uid);
    // Adding green background toolbox
    this.AddGreenBackgroundComponent.addGreenBackgroundHTMLCode(uid);
    this.AddGreenBackgroundComponent.addGreenBackgroundClickFunction(uid);

    // Adding yellow background toolbox
    this.AddYellowBackgroundComponent.addYellowBackgroundHTMLCode(uid);
    this.AddYellowBackgroundComponent.addYellowBackgroundClickFunction(uid);

    // Adding blue background toolbox
    this.AddBlueBackgroundComponent.addBlueBackgroundHTMLCode(uid);
    this.AddBlueBackgroundComponent.addBlueBackgroundClickFunction(uid);

    // Adding clear background toolbox
    this.AddClearBackgroundComponent.addClearBackgroundHTMLCode(uid);
    this.AddClearBackgroundComponent.addClearBackgroundClickFunction(uid);

    // Add OrderedList HTML and click Function
    this.AddOrderedListComponent.addOrderedListTagHTMLCode(uid);
    this.AddOrderedListComponent.addOrderedListTagClickFunction(uid);

    // Add UnOrderedList HTML and click Function
    this.AddUnOrderedListComponent.addUnOrderedListTagHTMLCode(uid);
    this.AddUnOrderedListComponent.addUnOrderedListTagClickFunction(uid);

    // Add Top HTML and click Function
    this.AddTopComponent.addTopTagHTMLCode(uid);
    this.AddTopComponent.addTopTagClickFunction(uid, this.addBlockEditor, checker);

    // Add Bottom HTML and click Function
    this.AddBottomComponent.addBottomTagHTMLCode(uid);
    this.AddBottomComponent.addBottomTagClickFunction(uid, this.addBlockEditor);

    // Add H1 HTML and click Function
    this.AddH1Component.addH1TagHTMLCode(uid);
    this.AddH1Component.addH1TagClickFunction(uid);

    // Adding H2 HTML and click function
    this.AddH2Component.addH2TagHTMLCode(uid);
    this.AddH2Component.addH2TagClickFunction(uid);

    // Adding H3 Tags
    this.AddH3Component.addH3TagHTMLCode(uid);
    this.AddH3Component.addH3TagClickFunction(uid);

    // Adding para tags
    this.AddParaComponent.addParaTagHTMLCode(uid);
    this.AddParaComponent.addParaTagClickFunction(uid);


    // Adding Left Align HTML and click Function
    this.AddLeftAlignComponent.addLeftAlignTagHTMLCode(uid);
    this.AddLeftAlignComponent.addLeftAlignTagClickFunction(uid);

    // Adding Center Align HTML and click Function
    this.AddCenterAlignComponent.addCenterAlignTagHTMLCode(uid);
    this.AddCenterAlignComponent.addCenterAlignTagClickFunction(uid);

    // Adding Right Align HTML and click Function
    this.AddRightAlignComponent.addRightAlignTagHTMLCode(uid);
    this.AddRightAlignComponent.addRightAlignTagClickFunction(uid);

  }


  // ......................... ESSENTIALS.............................

  disableTitleEnter() {
    $('#title[contenteditable]').keypress((evt) => {
      const keycode = evt.charCode || evt.keyCode;
      if (keycode === 13) {
        // Enter key's keycode
        return false;
      }
    });
  }

  // Check url validity
  validURL(str) {
    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // fragment locator
    return !!pattern.test(str);
  }

  arrayMoveMutate = (array, from, to) => {
    const startIndex = from < 0 ? array.length + from : from;

    if (startIndex >= 0 && startIndex < array.length) {
      const endIndex = to < 0 ? array.length + to : to;

      const [item] = array.splice(from, 1);
      array.splice(endIndex, 0, item);
    }
  }
  // Save board data
  async saveData() {
    const boardTitle = document.getElementById('title').innerText.trim();
    this.fileName = boardTitle;
    const data = [];

    const ids = [];
    $('#main-box>div').each(function(i) {
      if ($(this).prop('id').substring(0, 9) === 'cb-box-1-') {
        ids.push($(this).prop('id').substring(9));
      }
    });
    ids.forEach((key) => {
      const ele: NewBoardCard = this.userBlocks.get(key);
      if (ele.getpluginType() === 'editor' || ele.getpluginType() === undefined) {
        ele.setContent($(`#original-${key}`).html());
      } else if (ele.getpluginType() === 'board'){
        ele.setContent(this.AddCanvasBoard.getContent(ele.cardID));
      }
      ele.setClassList($(`#cb-box-2-${key}`).attr('class'));
      data.push(ele);
    });

    // Data Save

    if ((this.fileData !== null && this.fileData !== undefined) || this.fileID !== undefined) {
      const saveDataJson = {
        file_name: boardTitle === '' ? 'untitled' : boardTitle,
        file_id: this.fileID,
        data: [],
        is_modified: true
      };
      saveDataJson.data = data;
      this.apiService.saveBoardData(saveDataJson);
    } else {
      const createDataJson = {
        file_name: boardTitle === '' ? 'untitled' : boardTitle,
        folder_id: this.folderID,
        file_tag: 'testing',
        data: []
      };
      createDataJson.data = data;
      this.fileID = (await this.apiService.createBoardData(createDataJson))._id;

    }
    // this.addToast('testing');
    $('#saveToast').toast('show');
  }

  async retrieveData(fileID) {
    const response = await this.apiService.getBoardData(fileID);
    const boardData = await response.content;
    // console.log(boardData);
    this.populateData(boardData);
  }

  // Populate data from files component from Navigation Extras
  populateData(data: NewBoard | Params) {
    this.fileTag = data.file_tag;
    this.fileName = data.file_name;
    document.getElementById('title').innerText = this.fileName;
    let prevId = '';
    data.data.forEach( (element, index) => {
      this.userBlocks.set(element.cardID, NewBoardCard.fromData(element));
      if (index === 0) {
        $(`#sub-title`).after(this.blockFunction(element.cardID));
        this.addToolBox(element.cardID, 0);
      } else {
        $(`#cb-box-1-${prevId}`).after(this.blockFunction(element.cardID));
        this.addToolBox(element.cardID, 1);
      }
      if (element.pluginType === 'editor' || element.pluginType === undefined) {
      $(`#original-${element.cardID}`).html(element.content);
      } else if (element.pluginType === 'board'){
        this.AddCanvasBoard.setContent(element.cardID, element.content);
      } else if (element.pluginType === 'embed') {
        this.AddEmbedComponent.addEmbedToolBox(element.cardID, element.content);
      } else if (element.pluginType === 'tweet'){
        this.AddEmbedComponent.addEmbedHtmlToolBox(element.cardID, element.content);
      }
      $(`#cb-box-2-${element.cardID}`).addClass(element.classList);
      prevId = element.cardID;
    });
  }

  // Notification Code
  addToast = (body) => {
    $('#toasts').append(`
    <!-- Toast tag -->
    <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <img src="../../../assets/home/logo_bw.png" width="38" height="40" class="d-inline-block align-top mr-1" alt="CB" loading="lazy">
        <strong class="me-auto">Canvasboard Beta</strong>
        <small class="text-muted">just now</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${body}
      </div>
    </div>
    `);
  }


  // H1 Tag
  addH1TagHTMLCode = (uid) => {
    $(`#cb-buttons-${uid}`).append(`
    <!-- H1 tag -->
    <div class="tool box1 m-1">
      <button class="btn btn-light" id="add-h1-box2-${uid}">
        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-type-h1" fill="currentColor"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.637
13V3.669H7.379V7.62H2.758V3.67H1.5V13h1.258V8.728h4.62V13h1.259zm5.329 0V3.669h-1.244L10.5 5.316v1.265l2.16-1.565h.062V13h1.244z"/>
        </svg>
      </button>
    </div>
    `);
  }

  addH1TagClickFunction = (uid) => {
    $(`#add-h1-box2-${uid}`).click(() => {
      $(`#cb-box-2-${uid}`).removeClass('cb-H2 cb-H3').addClass('cb-H1');
    });
  }

  openSlideMenu = () => {
    document.getElementById('menu').style.width = '250px';
    document.getElementById('content').style.marginLeft = '250px';
  }
  closeSlideMenu = () => {
    document.getElementById('menu').style.width = '0';
    document.getElementById('content').style.marginLeft = '0';
  }

  // H1 TAG TOOLBOX CLICK FUNCTIONALITY
  cbToolBoxH1Tag = () => {
    this.addBlockEditor('main-box', 2);
  }
  // H2 TAG TOOLBOX CLICK FUNCTIONALITY
  cbToolboxH2Tag = () => {
    this.addBlockEditor('main-box', 4);
  }
  // H3 TAG TOOLBOX CLICK FUNCTIONALITY
  cbToolboxH3Tag = () => {
    this.addBlockEditor('main-box', 5);
  }
  // Canvasboard TOOLBOX CLICK FUNCTION
  addCanvasBoard = () => {
    this.addBlockEditor('main-box', 3);
  }
  // Adding paragraph
  cbToolboxParaTag = () => {
    this.addBlockEditor('main-box', 6);
  }

  // Adding Delete
  cbToolboxDeleteTag = () => {
    this.AddDeleteComponent.addDeleteTagToolBox(this.currentChartID);
  }

  // Adding Top
  cbToolboxTopTag = () => {
    this.AddTopComponent.addTopTagToolBox(this.currentChartID, this.addBlockEditor);
  }

  // Adding Bottom
  cbToolboxBottomTag = () => {
    this.AddBottomComponent.addBottomTagToolBox(this.currentChartID, this.addBlockEditor);
  }
  // Adding Red background color
  cbToolboxRedBackground = () => {
    this.addBlockEditor('main-box', 7);
  }

  // Adding Blue background color
  cbToolboxBlueBackground = () => {
    this.addBlockEditor('main-box', 8);
  }

  // Adding Yellow background color
  cbToolboxYellowBackground = () => {
    this.addBlockEditor('main-box', 9);
  }

  // Adding Green background color
  cbToolboxGreenBackground = () => {
    this.addBlockEditor('main-box', 10);
  }

  // Adding Monospace font
  cbToolboxMonospace = () => {
    this.addBlockEditor('main-box', 11);
  }

  // Adding Playfair font
  cbToolboxPlayfair = () => {
    this.addBlockEditor('main-box', 12);
  }

  // Adding Kalam font
  cbToolboxKalam = () => {
    this.addBlockEditor('main-box', 17);
  }

  // Clearing all fonts for Roboto font
  cbToolboxRoboto = () => {
    this.addBlockEditor('main-box', 13);
  }

  // Clearing all fonts
  cbToolboxClearFont = () => {
    this.AddClearFontComponent.addClearFontToolBox(this.currentChartID);
  }

  // Adding Left Align Text
  cbToolboxLeftAlign = () => {
    this.addBlockEditor('main-box', 14);
  }

  // Adding Center Align Text
  cbToolboxCenterAlign = () => {
    this.addBlockEditor('main-box', 15);
  }

  // Adding Right Align Text
  cbToolboxRightAlign = () => {
    this.addBlockEditor('main-box', 16);
  }

  // Adding Embed Link
  cbToolboxEmbed = () => {
    this.addBlockEditor('main-box', 18);
  }

  // Adding PdfRender
  cbToolboxPdfRender = () => {
    $('#pdfFile').click();
    this.addBlockEditor('main-box', 19);
  }

  // Adding Youtube
  cbToolboxYoutube = () => {
    this.addBlockEditor('main-box', 18, false, $('#youtubeEmbedURL').val().replace(/watch\?v=/gi, 'embed/'));
  }

  // Adding Clock
  cbToolboxClock = () => {
    this.addBlockEditor('main-box', 18, false, 'plugins/clock');
  }

  // Adding Twitter
  cbToolboxTwitter = async () => {
    const response = await this.apiService.getTweet($('#twitterEmbedURL').val());
    this.addBlockEditor('main-box', 20, false, response.html);

  }
}
