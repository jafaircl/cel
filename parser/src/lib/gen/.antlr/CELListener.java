// Generated from /Users/jonathanfaircloth/Projects/cel/parser/src/lib/gen/CEL.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link CELParser}.
 */
public interface CELListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by {@link CELParser#start}.
	 * @param ctx the parse tree
	 */
	void enterStart(CELParser.StartContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#start}.
	 * @param ctx the parse tree
	 */
	void exitStart(CELParser.StartContext ctx);
	/**
	 * Enter a parse tree produced by {@link CELParser#expr}.
	 * @param ctx the parse tree
	 */
	void enterExpr(CELParser.ExprContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#expr}.
	 * @param ctx the parse tree
	 */
	void exitExpr(CELParser.ExprContext ctx);
	/**
	 * Enter a parse tree produced by {@link CELParser#conditionalOr}.
	 * @param ctx the parse tree
	 */
	void enterConditionalOr(CELParser.ConditionalOrContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#conditionalOr}.
	 * @param ctx the parse tree
	 */
	void exitConditionalOr(CELParser.ConditionalOrContext ctx);
	/**
	 * Enter a parse tree produced by {@link CELParser#conditionalAnd}.
	 * @param ctx the parse tree
	 */
	void enterConditionalAnd(CELParser.ConditionalAndContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#conditionalAnd}.
	 * @param ctx the parse tree
	 */
	void exitConditionalAnd(CELParser.ConditionalAndContext ctx);
	/**
	 * Enter a parse tree produced by {@link CELParser#relation}.
	 * @param ctx the parse tree
	 */
	void enterRelation(CELParser.RelationContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#relation}.
	 * @param ctx the parse tree
	 */
	void exitRelation(CELParser.RelationContext ctx);
	/**
	 * Enter a parse tree produced by {@link CELParser#calc}.
	 * @param ctx the parse tree
	 */
	void enterCalc(CELParser.CalcContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#calc}.
	 * @param ctx the parse tree
	 */
	void exitCalc(CELParser.CalcContext ctx);
	/**
	 * Enter a parse tree produced by the {@code MemberExpr}
	 * labeled alternative in {@link CELParser#unary}.
	 * @param ctx the parse tree
	 */
	void enterMemberExpr(CELParser.MemberExprContext ctx);
	/**
	 * Exit a parse tree produced by the {@code MemberExpr}
	 * labeled alternative in {@link CELParser#unary}.
	 * @param ctx the parse tree
	 */
	void exitMemberExpr(CELParser.MemberExprContext ctx);
	/**
	 * Enter a parse tree produced by the {@code LogicalNot}
	 * labeled alternative in {@link CELParser#unary}.
	 * @param ctx the parse tree
	 */
	void enterLogicalNot(CELParser.LogicalNotContext ctx);
	/**
	 * Exit a parse tree produced by the {@code LogicalNot}
	 * labeled alternative in {@link CELParser#unary}.
	 * @param ctx the parse tree
	 */
	void exitLogicalNot(CELParser.LogicalNotContext ctx);
	/**
	 * Enter a parse tree produced by the {@code Negate}
	 * labeled alternative in {@link CELParser#unary}.
	 * @param ctx the parse tree
	 */
	void enterNegate(CELParser.NegateContext ctx);
	/**
	 * Exit a parse tree produced by the {@code Negate}
	 * labeled alternative in {@link CELParser#unary}.
	 * @param ctx the parse tree
	 */
	void exitNegate(CELParser.NegateContext ctx);
	/**
	 * Enter a parse tree produced by the {@code MemberCall}
	 * labeled alternative in {@link CELParser#member}.
	 * @param ctx the parse tree
	 */
	void enterMemberCall(CELParser.MemberCallContext ctx);
	/**
	 * Exit a parse tree produced by the {@code MemberCall}
	 * labeled alternative in {@link CELParser#member}.
	 * @param ctx the parse tree
	 */
	void exitMemberCall(CELParser.MemberCallContext ctx);
	/**
	 * Enter a parse tree produced by the {@code Select}
	 * labeled alternative in {@link CELParser#member}.
	 * @param ctx the parse tree
	 */
	void enterSelect(CELParser.SelectContext ctx);
	/**
	 * Exit a parse tree produced by the {@code Select}
	 * labeled alternative in {@link CELParser#member}.
	 * @param ctx the parse tree
	 */
	void exitSelect(CELParser.SelectContext ctx);
	/**
	 * Enter a parse tree produced by the {@code PrimaryExpr}
	 * labeled alternative in {@link CELParser#member}.
	 * @param ctx the parse tree
	 */
	void enterPrimaryExpr(CELParser.PrimaryExprContext ctx);
	/**
	 * Exit a parse tree produced by the {@code PrimaryExpr}
	 * labeled alternative in {@link CELParser#member}.
	 * @param ctx the parse tree
	 */
	void exitPrimaryExpr(CELParser.PrimaryExprContext ctx);
	/**
	 * Enter a parse tree produced by the {@code Index}
	 * labeled alternative in {@link CELParser#member}.
	 * @param ctx the parse tree
	 */
	void enterIndex(CELParser.IndexContext ctx);
	/**
	 * Exit a parse tree produced by the {@code Index}
	 * labeled alternative in {@link CELParser#member}.
	 * @param ctx the parse tree
	 */
	void exitIndex(CELParser.IndexContext ctx);
	/**
	 * Enter a parse tree produced by the {@code IdentOrGlobalCall}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void enterIdentOrGlobalCall(CELParser.IdentOrGlobalCallContext ctx);
	/**
	 * Exit a parse tree produced by the {@code IdentOrGlobalCall}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void exitIdentOrGlobalCall(CELParser.IdentOrGlobalCallContext ctx);
	/**
	 * Enter a parse tree produced by the {@code Nested}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void enterNested(CELParser.NestedContext ctx);
	/**
	 * Exit a parse tree produced by the {@code Nested}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void exitNested(CELParser.NestedContext ctx);
	/**
	 * Enter a parse tree produced by the {@code CreateList}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void enterCreateList(CELParser.CreateListContext ctx);
	/**
	 * Exit a parse tree produced by the {@code CreateList}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void exitCreateList(CELParser.CreateListContext ctx);
	/**
	 * Enter a parse tree produced by the {@code CreateMap}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void enterCreateMap(CELParser.CreateMapContext ctx);
	/**
	 * Exit a parse tree produced by the {@code CreateMap}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void exitCreateMap(CELParser.CreateMapContext ctx);
	/**
	 * Enter a parse tree produced by the {@code CreateMessage}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void enterCreateMessage(CELParser.CreateMessageContext ctx);
	/**
	 * Exit a parse tree produced by the {@code CreateMessage}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void exitCreateMessage(CELParser.CreateMessageContext ctx);
	/**
	 * Enter a parse tree produced by the {@code ConstantLiteral}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void enterConstantLiteral(CELParser.ConstantLiteralContext ctx);
	/**
	 * Exit a parse tree produced by the {@code ConstantLiteral}
	 * labeled alternative in {@link CELParser#primary}.
	 * @param ctx the parse tree
	 */
	void exitConstantLiteral(CELParser.ConstantLiteralContext ctx);
	/**
	 * Enter a parse tree produced by {@link CELParser#exprList}.
	 * @param ctx the parse tree
	 */
	void enterExprList(CELParser.ExprListContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#exprList}.
	 * @param ctx the parse tree
	 */
	void exitExprList(CELParser.ExprListContext ctx);
	/**
	 * Enter a parse tree produced by {@link CELParser#listInit}.
	 * @param ctx the parse tree
	 */
	void enterListInit(CELParser.ListInitContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#listInit}.
	 * @param ctx the parse tree
	 */
	void exitListInit(CELParser.ListInitContext ctx);
	/**
	 * Enter a parse tree produced by {@link CELParser#fieldInitializerList}.
	 * @param ctx the parse tree
	 */
	void enterFieldInitializerList(CELParser.FieldInitializerListContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#fieldInitializerList}.
	 * @param ctx the parse tree
	 */
	void exitFieldInitializerList(CELParser.FieldInitializerListContext ctx);
	/**
	 * Enter a parse tree produced by {@link CELParser#optField}.
	 * @param ctx the parse tree
	 */
	void enterOptField(CELParser.OptFieldContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#optField}.
	 * @param ctx the parse tree
	 */
	void exitOptField(CELParser.OptFieldContext ctx);
	/**
	 * Enter a parse tree produced by {@link CELParser#mapInitializerList}.
	 * @param ctx the parse tree
	 */
	void enterMapInitializerList(CELParser.MapInitializerListContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#mapInitializerList}.
	 * @param ctx the parse tree
	 */
	void exitMapInitializerList(CELParser.MapInitializerListContext ctx);
	/**
	 * Enter a parse tree produced by {@link CELParser#optExpr}.
	 * @param ctx the parse tree
	 */
	void enterOptExpr(CELParser.OptExprContext ctx);
	/**
	 * Exit a parse tree produced by {@link CELParser#optExpr}.
	 * @param ctx the parse tree
	 */
	void exitOptExpr(CELParser.OptExprContext ctx);
	/**
	 * Enter a parse tree produced by the {@code Int}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void enterInt(CELParser.IntContext ctx);
	/**
	 * Exit a parse tree produced by the {@code Int}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void exitInt(CELParser.IntContext ctx);
	/**
	 * Enter a parse tree produced by the {@code Uint}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void enterUint(CELParser.UintContext ctx);
	/**
	 * Exit a parse tree produced by the {@code Uint}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void exitUint(CELParser.UintContext ctx);
	/**
	 * Enter a parse tree produced by the {@code Double}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void enterDouble(CELParser.DoubleContext ctx);
	/**
	 * Exit a parse tree produced by the {@code Double}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void exitDouble(CELParser.DoubleContext ctx);
	/**
	 * Enter a parse tree produced by the {@code String}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void enterString(CELParser.StringContext ctx);
	/**
	 * Exit a parse tree produced by the {@code String}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void exitString(CELParser.StringContext ctx);
	/**
	 * Enter a parse tree produced by the {@code Bytes}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void enterBytes(CELParser.BytesContext ctx);
	/**
	 * Exit a parse tree produced by the {@code Bytes}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void exitBytes(CELParser.BytesContext ctx);
	/**
	 * Enter a parse tree produced by the {@code BoolTrue}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void enterBoolTrue(CELParser.BoolTrueContext ctx);
	/**
	 * Exit a parse tree produced by the {@code BoolTrue}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void exitBoolTrue(CELParser.BoolTrueContext ctx);
	/**
	 * Enter a parse tree produced by the {@code BoolFalse}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void enterBoolFalse(CELParser.BoolFalseContext ctx);
	/**
	 * Exit a parse tree produced by the {@code BoolFalse}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void exitBoolFalse(CELParser.BoolFalseContext ctx);
	/**
	 * Enter a parse tree produced by the {@code Null}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void enterNull(CELParser.NullContext ctx);
	/**
	 * Exit a parse tree produced by the {@code Null}
	 * labeled alternative in {@link CELParser#literal}.
	 * @param ctx the parse tree
	 */
	void exitNull(CELParser.NullContext ctx);
}