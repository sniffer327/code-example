import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// Urls
import { RealtorsUrls } from '../../urls';

// Interfaces
import { IResponse, IResponseList } from '../../interfaces';

// Models
import { RealtorModel, RealtorShortModel } from '../../models';

// RxJs
import { Observable } from 'rxjs/Observable';

// Сервис для работы с риелторами
@Injectable()
export class RealtorsService {

	constructor(
		private readonly http: HttpClient
	) { }

	/**
	 * Загрузка списка риелторов
	 * @param url URL для загрузки списка риелторов
	 * @param queryParams Параметры запроса
	 */
	private loadRealtorsList(url: string, queryParams: any): Observable<IResponse<IResponseList<RealtorShortModel>>> {
		const minSerachLength = 3;

		return queryParams.query && queryParams.query.length >= minSerachLength
			? this.http.get<IResponse<IResponseList<RealtorShortModel>>>(RealtorsUrls.search(url), { params: queryParams })
			: this.http.get<IResponse<IResponseList<RealtorShortModel>>>(url, { params: queryParams });
	}

	/**
	 * Загрузка списка всех релторов
	 * @param queryParams Параметры запроса
	 */
	public getList(queryParams: any): Observable<IResponse<IResponseList<RealtorShortModel>>> {
		const requestUrl = RealtorsUrls.list;

		return this.loadRealtorsList(requestUrl, queryParams);
	}

	/**
	 * Загрузка списка релторов на модерации повышения
	 * @param queryParams Параметры запроса
	 */
	public getIncreaseModerationList(queryParams: any): Observable<IResponse<IResponseList<RealtorShortModel>>> {
		const requestUrl = RealtorsUrls.increaseModarationList;

		return this.loadRealtorsList(requestUrl, queryParams);
	}

	/**
	 * Загрузка списка релторов на модерации изменений
	 * @param queryParams Параметры запроса
	 */
	public getUpdateModerationList(queryParams: any): Observable<IResponse<IResponseList<RealtorShortModel>>> {
		const requestUrl = RealtorsUrls.updateModarationList;

		return this.loadRealtorsList(requestUrl, queryParams);
	}

	/**
	 * Одобрение запроса на модерацию
	 * @param userGuid GUID риелтора
	 */
	public applyModeration(userGuid: string): Observable<IResponse<boolean>> {
		const requestUrl = RealtorsUrls.applyModeration(userGuid);

		return this.http.post<IResponse<boolean>>(requestUrl, null);
	}

	/**
	 * Отклонение запроса на модерацию
	 * @param userGuid GUID риелтора
	 * @param reason Причина отклонения
	 */
	public rejectModeration(userGuid: string, reason: string): Observable<IResponse<boolean>> {
		const requestUrl = RealtorsUrls.rejectModeration(userGuid);

		return this.http.post<IResponse<boolean>>(requestUrl, { reason });
	}

	// Загрузить актуальную информацию о риелторе
	public getRealtorInfo(realtorGuid: string): Observable<IResponse<RealtorModel>> {
		const url = RealtorsUrls.realtorInfo(realtorGuid);

		return this.http.get<IResponse<RealtorModel>>(url);
	}

	// Загрузить информацию о риелторе на модерации
	public getRealtorModerationInfo(realtorGuid: string): Observable<IResponse<RealtorModel>> {
		const url = RealtorsUrls.realtorInfoOnModeration(realtorGuid);

		return this.http.get<IResponse<RealtorModel>>(url);
	}

	/**
	 * Обновление профиля риелтора
	 * @param realtorGuid GUID риелтора
	 * @param data Данные
	 */
	public updateRealtor(realtorGuid: string, data: FormData): Observable<IResponse<RealtorModel>> {
		const url = RealtorsUrls.update(realtorGuid);

		return this.http.put<IResponse<RealtorModel>>(url, data);
	}
}
