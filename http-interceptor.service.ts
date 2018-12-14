import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// Services
import { CurrentUserService } from '../current-user.service';

// Constants
import { userTokenStorageKey } from 'app/core/consts';

// Routes
import { AuthRoutes } from 'app/core/routes';

// RxJs
import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators/catchError';

// Сервис-интерцептор для обработки http запросов
@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

	constructor(
		private readonly currentUserService: CurrentUserService,
		private readonly router: Router
	) {
	}

	// Обработка ошибок запросов
	private errorHandler(error: HttpErrorResponse): ErrorObservable {
		const unauthorizedStatusCode = 401;

		const isError = error instanceof HttpErrorResponse;

		// Ошибка аутентификации
		const unauthorizedError = isError && error.status === unauthorizedStatusCode;

		// Перенаправление на страницу авторизации
		const navigateToAuthPage = (): void => {
			this.router.navigateByUrl(AuthRoutes.login);
		};

		// При ошибке авторизации
		if (unauthorizedError) {
			this.currentUserService.logout()
				.subscribe(
					navigateToAuthPage,
					navigateToAuthPage
				);
		}

		return Observable.throw(error);
	}

	public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		// Токен текущего пользователя
		const currentUserToken = this.currentUserService.token;

		// Дополнительные параметры текущего запроса
		let requestOptions = {};

		// Добавление токена пользователя при его наличии
		if (this.currentUserService.isAuth) {
			requestOptions = {
				setHeaders: {
					[userTokenStorageKey]: currentUserToken
				}
			};
		}

		const currentRequest = request.clone(requestOptions);

		return next.handle(currentRequest)
			.pipe(
				catchError((error: HttpErrorResponse) => this.errorHandler(error))
			);
	}
}
