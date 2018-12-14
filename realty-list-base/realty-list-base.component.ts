import { OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Interfaces
import { IRealty, IResponse, IResponseList } from 'app/core/interfaces';
import { ITableColumn, ITableSort } from 'app/shared/interfaces';
import { IRealtyFilterService, IRealtyListFilter, IRealtyListQueryParams } from '../../interfaces';

// Services
import { SelectedRealtyService } from '../../services';

// Routes
import { RealtyRoutes } from 'app/core/routes';

// Pipes
import { DatePipe } from 'app/ui/pipes';

// RxJs
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { Subscription } from 'rxjs/Subscription';

// Базовый компонент списка объявлений
export abstract class RealtyListBaseComponent implements OnInit, OnDestroy {
	// Параметры колонок таблицы
	protected abstract columns: ITableColumn[];

	// Текущая страница
	protected page = 1;

	// Общее кол-во страниц
	protected pageCount: number = 1;

	// Общее кол-во объявлений
	protected totalCount: number = 0;

	// Массив подписок
	protected subscriptions: Subscription[] = [];

	// Дозагружаются объявления при скролле
	protected isLoadingMoreRealty: Subscription;

	// Отобразить пунк "Активность" в фильтрах
	public showActivity = false;

	// Список объявлений
	public realtyList: IRealty[] = [];

	// Последняя страница
	public isLastPage = false;

	// Отображение лоадера при первоначальной загрузке
	public showFirstRealtyLoader = true;

	// Статус отображения фильтров
	public isFilterShown = false;

	constructor(
		protected readonly realtyFilterService: IRealtyFilterService,
		protected readonly router: Router
	) {}

	// Инициализация компонента
	// tslint:disable-next-line:no-empty
	protected initialize(): void {}

	// Инициализация подписок на фильтры
	protected initSubscriptions(): void {
		this.subscriptions = [
			this.realtyFilterService.filtersChange
				.subscribe(() => {
					this.reload();
				})
		];
	}

	// Уничтожение подписок
	protected destroySubscriptions(): void {
		this.subscriptions.forEach(
			(s: Subscription) => {
				s.unsubscribe();
			}
		);

		if (this.isLoadingMoreRealty) {
			this.isLoadingMoreRealty.unsubscribe();
		}
	}

	// Преобразование данных объявлений для отображения в таблице
	protected prepareRealty(list: IRealty[]): IRealty[] {
		const datePipe = new DatePipe();

		return list.map((realty: IRealty) => {
			const preparedRealty = realty;

			const activeStatusText = preparedRealty.is_sale_published
				? 'Опубликовано на НС'
				: 'Активно';

			preparedRealty.statusName = preparedRealty.is_published
				? activeStatusText
				: 'Не активно';

			preparedRealty.createdDate = datePipe.transform(preparedRealty.created);
			preparedRealty.cityName = preparedRealty.city.title;
			preparedRealty.authorName = `${preparedRealty.author.firstname} ${preparedRealty.author.lastname}`;
			preparedRealty.actionName = preparedRealty.action.title;
			preparedRealty.entityName = preparedRealty.entity.title;

			return preparedRealty;
		});
	}

	// Получение списка объявлений
	protected abstract getList(query: any): Observable<IResponse<IResponseList<IRealty>>> ;

	/**
	 * Загрузка списка объявлений
	 * @param clearBefore Очистить список
	 */
	protected getRealtyList(clearBefore: boolean = false): void {
		if (!this.isLoadingMoreRealty) {
			if (clearBefore) {
				this.realtyList = [];
			}

			const query: IRealtyListQueryParams = this.realtyFilterService.prepareQueryParams();

			query.page = this.page;

			this.isLoadingMoreRealty = this.getList(query)
				.pipe(
					map((response: IResponse<IResponseList<IRealty>>) => {
						this.pageCount = response.data.pages;

						this.totalCount = response.data.totalCount;

						this.isLastPage = this.page === this.pageCount;

						return this.prepareRealty(response.data.items);
					})
				)
				.subscribe(
					(realtyList: IRealty[]) => {
						this.realtyList = this.realtyList.concat(...realtyList);

						this.showFirstRealtyLoader = false;

						this.isLoadingMoreRealty = null;
					},
					() => {
						this.realtyList = [];

						this.showFirstRealtyLoader = false;

						this.isLoadingMoreRealty = null;
					}
				);
		}
	}

	// Дозагрузка списка объявлений при скролле
	public loadMoreRealty(): void {
		if (this.pageCount && !this.isLoadingMoreRealty && (this.page < this.pageCount)) {
			this.page++;

			this.getRealtyList();
		}
	}

	// Перезагрузка списка объявлений
	public reload(): void {
		this.showFirstRealtyLoader = true;

		this.page = 1;

		this.getRealtyList(true);
	}

	// Функция отображения фильтров
	public showFilter(): void {
		this.isFilterShown = !this.isFilterShown;
	}

	// Применить фильтры
	public applyFilters(newFilters: IRealtyListFilter): void {
		this.realtyFilterService.filters = { ...this.realtyFilterService.filters, ...newFilters };
	}

	// При смене сортировки
	public changeSorting(sort: ITableSort): void {
		this.realtyFilterService.changeSorting(sort);
	}

	/**
	 * Сбросить фильтры
	 * @param closeFilters Закрыть блок с фильтрами
	 */
	public clearFilters(closeFilters: boolean = false): void {
		this.realtyFilterService.clearFilters();

		if (closeFilters) {
			this.isFilterShown = false;
		}
	}

	// Начличие фильтров
	public get hasFilters(): boolean {
		return this.realtyFilterService.hasFilters;
	}

	// Выбранный тип сортировки
	public get sort(): ITableSort {
		return this.realtyFilterService.filters.sort
			? this.realtyFilterService.filters.sort
			: {};
	}

	// Перейти к объявлению
	public goToRealty(guid: string): void {
		const currentUrl = this.router.url;

		SelectedRealtyService.selectedRealty = this.realtyList
			.find((realty: IRealty) => realty.guid === guid);

		switch (currentUrl) {
			case RealtyRoutes.all:
			{
				this.router.navigateByUrl(RealtyRoutes.about(guid));
			}
			break;

			case RealtyRoutes.ns:
			{
				this.router.navigateByUrl(RealtyRoutes.aboutNs(guid));
			}
			break;

			case RealtyRoutes.publish:
			{
				this.router.navigateByUrl(RealtyRoutes.moderatePublish(guid));
			}
			break;

			case RealtyRoutes.update:
			{
				this.router.navigateByUrl(RealtyRoutes.moderateUpdate(guid));
			}
			break;

			default: return;
		}
	}

	public ngOnInit(): void {
		this.initialize();
		this.initSubscriptions();
		this.getRealtyList(true);
	}

	public ngOnDestroy(): void {
		this.destroySubscriptions();
	}
}
