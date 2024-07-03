import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { RateCardMemo, TRateProps, useRateCards } from "src/entities/rate";
import classnames from "classnames";
import { useAction, useAppSelector } from "src/shared/lib/hooks/redux";

import "./promo.scss";
import { PromoLastСhanceModal } from "./promo-modal";

const mockPageRateOptions: Omit<TRateProps, "onSelect" | "selected">[] = [
  {
    id: "9cb876c5-9758-4215-abd6-bdeadb9f1ce4",
    name: "1 неделя",
    price: 999,
    discount: 699,
    sidenote: "Чтобы просто начать 👍🏻"
  },
  {
    id: "8cd07806-bf89-4209-9e39-d81cb68d6837",
    name: "1 месяц",
    price: 1690,
    discount: 999,
    sidenote: "Привести тело впорядок 💪🏻"
  },
  {
    id: "6aaf56d2-9854-439e-be23-fc9757e8114e",
    name: "3 месяца",
    price: 5990,
    discount: 2990,
    sidenote: "Изменить образ жизни 🔥"
  },
  {
    id: "6ce81fa9-c558-40a4-923e-29b9c7be9333",
    name: "Навсегда",
    price: 18990,
    discount: 5990,
    sidenote: "Всегда быть в форме и поддерживать своё здоровье ⭐️"
  }
];
export const PromoPage = () => {
  const { lastChanceActive, discountActive } = useAppSelector(s => s.discount);
  const { changeLastChanceState } = useAction();

  const [privacyAccept, setPrivacyAccept] = useState(false);
  const { selectedCardId, selectCard } = useRateCards();
  const cb = useMemo(() => {
    return mockPageRateOptions.map(r => () => selectCard(r.id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const highlightBtnActive = privacyAccept === true && selectedCardId !== null;

  return (
    <>
      <div className='promo__wrapper'>
        <div className='page promo' id='promo'>
          <h1 className='promo__title'>Выберите подходящий тарифный план</h1>
          <div className='promo__content'>
            <div className='image__wrapper'>
              <div className='image__effect'>
                <img className='image' draggable='false' src='/assets/images/to_be_2.png' alt='накачанный мужчина' />
              </div>
            </div>
            <div className='promo__info'>
              <div className='rate__wrapper'>
                <ul className='rate__options'>
                  {mockPageRateOptions.map((r, idx) => (
                    <li className='rate__option' key={r.id}>
                      <RateCardMemo {...r} discountActive={discountActive} onSelect={cb[idx]} selected={r.id === selectedCardId} />
                    </li>
                  ))}
                </ul>
                <span className='rate__sidenote'>Следуя плану на 3 месяца, люди получают в 2 раза лучший результат, чем за 1 месяц</span>
              </div>
              <div className='promo__privacy-policy'>
                <input
                  id='privacy-policy'
                  className='privacy-policy__input'
                  type='checkbox'
                  checked={privacyAccept}
                  onChange={e => setPrivacyAccept(e.target.checked)}
                />
                <label htmlFor='privacy-policy' className='privacy-policy__description'>
                  Я соглашаюсь с{" "}
                  <Link className='privacy-policy__link' to={"/"}>
                    правилами сервиса
                  </Link>{" "}
                  и условиями{" "}
                  <Link className='privacy-policy__link' to={"/"}>
                    публичной оферты.
                  </Link>
                </label>
              </div>
              <div className='promo__checkout'>
                <button className={classnames("button--primary checkout__btn", { "checkout__btn--highlighted": highlightBtnActive })}>Купить</button>
                <span className='checkout__sidenote'>
                  Нажимая «Купить», Пользователь соглашается на автоматическое списание денежных средств по истечению купленного периода. Дальнейшие
                  списания по тарифам участвующим в акции осуществляются по полной стоимости согласно оферте.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PromoLastСhanceModal show={lastChanceActive} closeModal={() => changeLastChanceState({ active: false })} />
    </>
  );
};
