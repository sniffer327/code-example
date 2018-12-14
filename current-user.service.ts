import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

// Services
import { LocalStorageService, SessionStorageService } from 'gp-ng-cache-service';

// Models
import { CurrentUserModel } from '../models';

// Urls
import { CurrentUserUrls } from '../urls';

// Interfaces
import { ILoginResponse, IResponse, IUserRole } from '../interfaces';

// RxJs
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';

// Сервис текущего пользователя
@Injectable()
export class CurrentUserService {
	// Имя ключа в хранилище (localStorage или sessionStorage)
	private readonly storageTokenKey = 'token';

	// Токен авторизации
	private _token = '';

	// Данные пользователя
	private _userData: CurrentUserModel = new CurrentUserModel();

	constructor(
		private readonly http: HttpClient,
		private readonly localStorageService: LocalStorageService,
		private readonly sessionStorageService: SessionStorageService
	) {}

	/**
	 * Запись токена в хранилище
	 * @param token Токен
	 * @param rememberMe Флаг "Запомнить меня"
	 */
	private storeToken(token: string, rememberMe: boolean): Promise<string> {
		return rememberMe
			? this.localStorageService.set(this.storageTokenKey, token)
			: this.sessionStorageService.set(this.storageTokenKey, token);
	}

	// Получить токен из хранилища
	private restoreToken(): Observable<string> {
		return new Observable((observer: Observer<string>): void => {
			// Обновление токена
			const updateToken = (token: string): void => {
				this._token = token;

				observer.next(token);

				observer.complete();
			};

			this.localStorageService.get(this.storageTokenKey)
				.then((token: string) => {
					updateToken(token);
				})
				.catch(() => {
					this.sessionStorageService.get(this.storageTokenKey)
						.then((token: string) => {
							updateToken(token);
						})
						.catch((error: HttpErrorResponse) => {
							observer.error(error);
						});
				});
		});
	}

	// Удаление токена авторизации
	private clearToken(): Promise<void> {
		this._token = '';

		return Promise.race([
			this.localStorageService.clear(),
			this.sessionStorageService.clear()
		]);
	}

	// Загрузка данных о пользователе
	private loadUserData(): Observable<IResponse<ILoginResponse>> {
		return this.http.get<IResponse<ILoginResponse>>(CurrentUserUrls.self)
			.pipe(
				catchError((error: HttpErrorResponse) => {
					this.clearToken();

					return Observable.throw(error);
				})
			);
	}

	// Инициализация данных о пользователе
	public initUserData(): Observable<IResponse<ILoginResponse>> {
		return new Observable((observer: Observer<IResponse<ILoginResponse>>): void => {
			this.restoreToken()
				.subscribe(
					() => {

					this.loadUserData()
						.subscribe(
							(response: IResponse<ILoginResponse>) => {
								this._userData = response.data.user;

								observer.next(response);

								observer.complete();
							},
							() => {
								this.clearToken()
									.then(() => {
										observer.complete();
									})
									.catch(() => {
										observer.complete();
									});
							}
						);
					},
					() => {
						observer.complete();
					}
			);
		});
	}

	/**
	 * Вход в систему
	 * @param email Логин
	 * @param password Пароль
	 * @param rememberMe Флаг "Запомнить меня"
	 */
	public login(email: string, password: string, rememberMe: boolean): Observable<CurrentUserModel> {
		// Тело запроса
		const requestBody = { email, password };

		return new Observable((observer: Observer<CurrentUserModel>): void => {
			this.http.post(CurrentUserUrls.login, requestBody)
				.pipe(
					map((response: IResponse<ILoginResponse>) => response.data)
				)
				.subscribe(
					(response: ILoginResponse) => {
						this.storeToken(response.token, rememberMe)
							.then((storedToken: string) => {
								this._token = storedToken;

								this._userData = response.user;

								observer.next(response.user);

								observer.complete();
							})
							.catch((error: HttpErrorResponse) => {
								this._token = '';

								observer.error(error);
							});
					},
					(error: HttpErrorResponse) => {
						observer.error(error);
					}
				);
		});
	}

	// Выход из аккаунта
	public logout(): Observable<void> {
		return new Observable((observer: Observer<any>): void => {
			// Очищение данных
			const complete = (): void => {
				observer.next(true);

				// Очищение данных пользователя
				this._userData = new CurrentUserModel();

				observer.complete();
			};

			// Обработчик при выходе из системы
			const logoutHandler = (): void => {
				this.clearToken()
					.then(complete)
					.catch(complete);
			};

			this.http.delete(CurrentUserUrls.logout)
				.subscribe(logoutHandler, logoutHandler);
		});
	}

	// Получить информацию о текущем пользователе
	public get userData(): CurrentUserModel {
		return this._userData;
	}

	// Получить роли пользователя
	public get userRoles(): IUserRole[] {
		return this.userData.roles;
	}

	// Получить токен пользователя
	public get token(): string {
		return this._token;
	}

	// Авторизован ли пользователь
	public get isAuth(): boolean {
		return this.token.length > 0;
	}
}
