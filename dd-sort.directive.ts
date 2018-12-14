import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

// Drag'n'Drop
import { dragula, Group } from 'ng2-dragula';

// Models
import { IDDSortResponse } from '../interfaces';

// RxJS
import { Subscription } from 'rxjs/Subscription';

// Services
import { DragulaAdminService } from '../services';

// Директива сортировки Drag'n'Drop
@Directive({
	selector: '[appDDSort]'
})
export class DDSortDirective implements OnInit, OnDestroy {

	// Имя корзины в рамках которой происходит сортировка
	@Input() public bagName: string;

	/**
	 * CSS-класс который должен присутствовать в элементе на котором можно выполнять действие 'drag'
	 * Если не указан - на всем элементе
	 */
	@Input() public dragClass: string;

	/**
	 * Событие происходящее при действии 'drop'. Параметры в виде объекта, где:
	 * bagName - Имя корзины
	 * el      - Элемент который был захвачен
	 * target  - Элемент в который был перемещен захваченый элемент
	 * source  - Элемент из которого был перемещен захваченый элемент
	 * sibling - Элемент перед которым был помещен захваченый элемент (null - если в конец списка)
	 */
	@Output() public ddDrop: EventEmitter<IDDSortResponse> = new EventEmitter<IDDSortResponse>();

	private bag;
	private drake: any;
	private readonly container: any;

	// Подписки на события dragulaService-а
	private readonly subscriptions: Subscription[] = [];

	constructor(
		private readonly dragulaService: DragulaAdminService,
		private readonly el: ElementRef
	) {
		this.container = this.el.nativeElement;
	}

	// Инициализация подписок
	private initSubs(): void {
		if (this.dragulaService.checkSubscribers(this.bagName)) {
			return;
		}
		this.subscriptions.push(
			this.dragulaService.drop(this.bagName)
				.subscribe((response: IDDSortResponse) => {
					const bagName = response.name || '';

					if (bagName === this.bagName) {
						this.ddDrop.emit({
							name: bagName,
							el: response.el || null,
							target: response.target || null,
							source: response.source || null,
							sibling: response.sibling || null
						});
					}
				})
		);
	}

	// Уничтожение подписок
	private destroySubs(): void {
		this.subscriptions.forEach((sub: Subscription) => {
			sub.unsubscribe();
		});
	}

	// Инициализация drag'n'drop контейнера
	private initDragula(): void {
		this.bag = this.dragulaService.find(this.bagName);

		if (this.bag) {
			this.drake = this.bag.drake;
			this.drake.containers.push(this.container);

		} else {

			this.drake = dragula([this.container], {
				revertOnSpill: true,
				moves: (el: Element, source: Element, handle: any): boolean =>
					this.dragClass ? handle.classList.contains(this.dragClass) : true

			});

			const group = new Group(this.bagName, this.drake, {});

			this.dragulaService.add(group);
		}
	}

	public ngOnInit(): void {
		this.initDragula();

		this.initSubs();
	}

	public ngOnDestroy(): void {
		this.destroySubs();

		this.dragulaService.destroy(this.bagName);
	}
}
