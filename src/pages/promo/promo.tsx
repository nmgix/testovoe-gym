import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import classnames from "classnames";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Rate, RateCardMemo, TRateProps, useRateCards } from "src/entities/rate";
import { useAction, useAppSelector } from "src/shared/lib/hooks/redux";
import { fillArr } from "src/shared/lib/fillArray";

import { PromoLastСhanceModal } from "./promo-modal";

import "./promo.scss";
import { Breakpoints } from "src/shared/types/breakpoints";
import { useDebug } from "src/entities/debug";

const sidenotes = [
  "Чтобы просто начать 👍🏻",
  "Привести тело впорядок 💪🏻",
  "Изменить образ жизни 🔥",
  "Всегда быть в форме и поддерживать своё здоровье ⭐️"
];
const sidenotes_sm = [undefined, undefined, undefined, "Всегда быть в форме ⭐️"];

export const PromoPage = () => {
  const { lastChanceActive, discountActive } = useAppSelector(s => s.discount);
  const { changeDiscount, fetchRates } = useAction();
  const { debug } = useDebug();
  const [skeletonList, setSkeletonList] = useState(false);

  const { selectedCardId, selectCard } = useRateCards();
  const [privacyAccept, setPrivacyAccept] = useState(false);
  const highlightBtnActive = privacyAccept === true && selectedCardId !== null;

  const rates = useAppSelector(s => s.rate);
  useLayoutEffect(() => {
    fetchRates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const discounted_price_cards = useMemo(() => rates.slice(0, 4), [rates]);
  const original_price_cards = useMemo(() => rates.slice(4, 8), [rates]);
  const modal_discounted_price_cards = useMemo(() => (!skeletonList ? rates.slice(8, 11) : fillArr(3, undefined)), [rates, skeletonList]);

  const createListElement = useCallback(
    (el: Rate, idx: number, onSelect: () => void, discounted: boolean) => {
      return {
        ...el,
        onSelect,
        selected: el.id === selectedCardId,
        discount_from: discounted ? original_price_cards[idx].price : undefined,
        sidenote: sidenotes[idx],
        sidenote_sm: sidenotes_sm[idx]
      } as unknown as TRateProps;
    },
    [original_price_cards, selectedCardId]
  );

  const createList = useCallback(
    (list: Rate[], onSelect: (() => void)[], discounted: boolean) => {
      return list.map((c, idx) => createListElement(c, idx, onSelect[idx], discounted));
    },
    [createListElement]
  );

  const discounted_cards_cb = useMemo(() => {
    return discounted_price_cards.map(r => () => selectCard(r.id));
  }, [rates]); // eslint-disable-line react-hooks/exhaustive-deps
  const original_cards_cb = useMemo(() => {
    return original_price_cards.map(r => () => selectCard(r.id));
  }, [rates]); // eslint-disable-line react-hooks/exhaustive-deps

  const discountedList = useMemo(
    () => (!skeletonList ? createList(discounted_price_cards, discounted_cards_cb, true) : fillArr(4, undefined)),
    [discounted_price_cards, createList, discounted_cards_cb, skeletonList]
  );
  const originalList = useMemo(
    () => (!skeletonList ? createList(original_price_cards, original_cards_cb, false) : fillArr(4, undefined)),
    [original_price_cards, createList, original_cards_cb, skeletonList]
  );

  const listRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      if (discountActive) return;

      const animateCard = (element: Element, direction: "horizontal" | "vertical", delay?: number) => {
        const cardTL = gsap.timeline();
        const card = element.firstElementChild;
        if (!card) return console.log("Animation failed");
        const internalCards = card?.querySelectorAll(".rate-card");
        const discountBadge = internalCards.item(0)?.querySelector(".discount-badge");
        if (!discountBadge) return;
        const discountTL = gsap.timeline();

        const horizontal1Config: gsap.TweenVars = {
          duration: 1,
          rotateY: 90,
          ease: "elastic.in",
          onComplete: () => {
            (internalCards.item(0) as HTMLDivElement).style["zIndex"] = "0";
            (internalCards.item(0) as HTMLDivElement).style["display"] = "none";
            (internalCards.item(1) as HTMLDivElement).style["display"] = "flex";
            (internalCards.item(1) as HTMLDivElement).style["position"] = "relative";
          },
          delay
        };
        const horizontal2Config: gsap.TweenVars = {
          duration: 1,
          ease: "elastic.out",
          rotateY: 180,

          onComplete: () => {}
        };

        const vertical1Config: gsap.TweenVars = {
          duration: 1,
          rotateX: 90,
          ease: "elastic.in",
          onComplete: () => {
            (internalCards.item(0) as HTMLDivElement).style["zIndex"] = "0";
            (internalCards.item(0) as HTMLDivElement).style["display"] = "none";
            (internalCards.item(1) as HTMLDivElement).style["display"] = "flex";
            (internalCards.item(1) as HTMLDivElement).style["position"] = "relative";
            (internalCards.item(1) as HTMLDivElement).style["transform"] = "rotateX(180deg)";
          },
          delay
        };
        const vertical2Config: gsap.TweenVars = {
          duration: 1,
          ease: "elastic.out",
          rotateX: 180,

          onComplete: () => {}
        };

        cardTL
          .to(card, direction === "horizontal" ? horizontal1Config : vertical1Config)
          .to(card, direction === "horizontal" ? horizontal2Config : vertical2Config);

        discountTL.to(discountBadge, {
          delay: delay ? delay + 1 : 1,
          duration: 0.1,
          translateY: 40,
          ease: "elastic.in"
        });
      };

      const _nodes = listRef.current?.querySelectorAll(".rate__option");
      const nodes = [..._nodes!];
      const firstRow = nodes.slice(0, 3);
      const secondRow = nodes[3];

      firstRow?.forEach((el, idx) => {
        animateCard(el, "horizontal", idx * 0.1);
      });
      animateCard(secondRow, secondRow.scrollWidth <= Breakpoints["md-custom"] ? "horizontal" : "vertical", 0.4);

      selectCard(null);
    },
    { dependencies: [discountActive], scope: listRef }
  );

  return (
    <>
      {debug && (
        <div className='debug-window'>
          <input id='debug-skeleton-loader' type='checkbox' onChange={() => setSkeletonList(prev => !prev)} checked={skeletonList} />
          <label htmlFor='debug-skeleton-loader'>skeleton loader</label>
        </div>
      )}
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
                <ul ref={listRef} className='rate__options'>
                  {rates &&
                    fillArr(4, null).map((_, idx) => (
                      <li className='rate__option' key={idx}>
                        {discountedList[idx] === undefined || originalList[idx] === null ? (
                          <Skeleton key={idx} />
                        ) : (
                          <div className='rate__card-animation'>
                            <RateCardMemo {...discountedList[idx]!} />
                            <RateCardMemo {...originalList[idx]!} />
                          </div>
                        )}
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
      <PromoLastСhanceModal
        show={lastChanceActive}
        closeModal={() => changeDiscount({ lastChance: false })}
        discounted_price_cards={modal_discounted_price_cards}
        original_price_cards={original_price_cards}
      />
    </>
  );
};
