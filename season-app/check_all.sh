#!/bin/sh
# Все проверки рабочей копии одной командой: sh check_all.sh
# Печатает одну итоговую строку: ВСЁ В ПОРЯДКЕ или что именно не прошло.
cd "$(dirname "$0")" || exit 1
fail=""
python3 build_next.py > /dev/null 2>&1 || fail="$fail сборка"
node --check check-next.js 2> /dev/null || fail="$fail синтаксис"
python3 textcheck.py > /tmp/season-text.log 2>&1 || fail="$fail тексты"
node simcheck.js "${1:-200}" > /tmp/season-sim.log 2>&1 || fail="$fail баланс"
SEASON_STATE= SEASON_PAGE=test-next.html timeout 240 node bot2.js tap 4 > /tmp/season-bot.log 2>&1
n=$(grep -c "МАТЧ" /tmp/season-bot.log); e=$(grep -c "errors \[\]" /tmp/season-bot.log)
if grep -q "GUARD\|Error" /tmp/season-bot.log; then fail="$fail экран"; elif [ "$n" -lt 7 ]; then fail="$fail экран(сыграно_$n)"; fi
node mechcheck.js > /tmp/season-mech.log 2>&1 || node mechcheck.js > /tmp/season-mech.log 2>&1 || fail="$fail приёмы"
tail -1 /tmp/season-mech.log; tail -1 /tmp/season-sim.log; tail -1 /tmp/season-text.log; echo "экранный бот: матчей сыграно $n"
if [ -z "$fail" ]; then echo "ВСЁ В ПОРЯДКЕ"; else echo "НЕ ПРОШЛО:$fail (подробности в /tmp/season-*.log)"; exit 1; fi
